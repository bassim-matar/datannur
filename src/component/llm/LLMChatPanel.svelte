<script lang="ts">
  import { chatStream, transcribeAudio } from '@llm/llm-client'
  import { buildLLMContext } from '@llm/llm-context'
  import {
    isProxyAvailable,
    setProxyCredentials,
    checkProxyStatus,
  } from '@llm/llm-config'
  import markdownRender from '@lib/markdown'
  import { safeHtml } from '@lib/html-sanitizer'
  import Options from '@lib/options'
  import { clickOutside } from '@lib/util'
  import {
    viewportManager,
    chatPanelWidth,
    breakpoints,
  } from '@lib/viewport-manager'
  import type { ChatMessage, TranscriptionResponse } from '@llm/llm-client'

  let messages = $state<ChatMessage[]>([])
  let input = $state('')
  let loading = $state(false)
  let abortController = $state<AbortController | null>(null)
  let { isOpen = $bindable(false) } = $props<{ isOpen?: boolean }>()

  let apiKey = $state('')
  let productId = $state('')
  let isConfigured = $state(false)
  let configError = $state('')
  let configSuccess = $state('')

  let isRecording = $state(false)
  let isProcessing = $state(false)
  let isCancelled = $state(false)
  let mediaRecorder = $state<MediaRecorder | null>(null)
  let audioChunks: Blob[] = []
  let silenceTimeout: number | null = null
  let audioContext: AudioContext | null = null
  let analyser: AnalyserNode | null = null
  let chatContainer = $state<HTMLElement | null>(null)
  let textareaRef = $state<HTMLTextAreaElement | null>(null)

  const models = [
    {
      id: 'qwen3',
      name: 'Qwen3',
      description: 'Le plus puissant - Polyvalent',
      category: 'chat_large',
    },
    {
      id: 'llama3',
      name: 'Llama 3.3',
      description: 'Conversations et raisonnement',
      category: 'chat_large',
    },
    {
      id: 'mistral24b',
      name: 'Mistral Small 24B',
      description: "Vision et analyse d'images",
      category: 'vision_medium',
    },
    {
      id: 'gemma3n',
      name: 'Gemma 3n',
      description: 'Léger et rapide',
      category: 'omni_small',
    },
    {
      id: 'Qwen/Qwen3-Coder-480B-A35B-Instruct',
      name: 'Qwen3 Coder',
      description: 'Code, SQL et appels de fonctions',
      category: 'code_large',
    },
    {
      id: 'swiss-ai/Apertus-70B-Instruct-2509',
      name: 'Apertus 70B',
      description: 'Éthique - Conforme AI Act',
      category: 'chat_medium',
    },
  ]
  let selectedModel = $state(models[0]!)
  let showModelMenu = $state(false)

  Options.loaded.then(() => {
    const savedModelId = Options.get('llmModel') as string | undefined
    if (savedModelId) {
      const model = models.find(m => m.id === savedModelId)
      if (model) selectedModel = model
    }
  })

  let messagesWithHtml = $derived(
    messages.map(msg => {
      if (msg.role === 'assistant' && msg.content) {
        const result = markdownRender(msg.content)
        return {
          ...msg,
          html: result instanceof Promise ? '' : (result as string),
        }
      }
      return { ...msg, html: '' }
    }),
  )

  $effect(() => {
    checkConfiguration()
  })

  $effect(() => {
    if (typeof window !== 'undefined') {
      let width = 0
      if (isOpen) {
        if (window.innerWidth <= breakpoints.smallMobile) {
          width = window.innerWidth
        } else {
          width = chatPanelWidth as number
        }
      }
      viewportManager.setChatWidth(width)
    }
  })

  $effect(() => {
    if (isOpen && textareaRef) {
      setTimeout(() => textareaRef?.focus(), 100)
    }
  })

  $effect(() => {
    if (textareaRef) {
      textareaRef.style.height = 'auto'
      textareaRef.style.height = `${textareaRef.scrollHeight}px`
    }
  })

  async function checkConfiguration(): Promise<void> {
    if (!isProxyAvailable()) {
      isConfigured = false
      return
    }

    const status = await checkProxyStatus()
    isConfigured = status.configured
  }

  async function saveConfig(): Promise<void> {
    if (!apiKey || !productId) return

    configError = ''
    configSuccess = ''

    const result = await setProxyCredentials(apiKey, productId)

    if (result.success) {
      configSuccess = result.message ?? 'Configuration enregistrée'
      isConfigured = true
      apiKey = ''
      productId = ''
    } else {
      configError = result.error ?? 'Erreur lors de la sauvegarde'
    }
  }

  async function sendMessage() {
    if (!input.trim() || loading) return

    const userMessage: ChatMessage = { role: 'user', content: input }
    messages = [...messages, userMessage]
    input = ''

    if (textareaRef) {
      textareaRef.style.height = 'auto'
    }

    // Scroll to bottom when user sends a message
    setTimeout(() => {
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight
      }
    }, 0)

    loading = true
    abortController = new AbortController()

    const assistantMessage: ChatMessage = { role: 'assistant', content: '' }
    messages = [...messages, assistantMessage]

    try {
      const context = buildLLMContext({ includeFullData: false })
      const systemMessage: ChatMessage = {
        role: 'system',
        content: `Stats DB: ${context.stats.nbDataset} datasets, ${context.stats.nbVariable} variables`,
      }

      const allMessages = [systemMessage, ...messages.slice(0, -1)]

      await chatStream(
        allMessages,
        (chunk: string) => {
          const lastIndex = messages.length - 1
          messages = [
            ...messages.slice(0, lastIndex),
            {
              ...messages[lastIndex]!,
              content: messages[lastIndex]!.content + chunk,
            },
          ]
        },
        { model: selectedModel.id, signal: abortController.signal },
      )
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Stream stopped by user')
      } else {
        console.error('Error:', error)
        const lastIndex = messages.length - 1
        messages = [
          ...messages.slice(0, lastIndex),
          { ...messages[lastIndex]!, content: `Erreur: ${error}` },
        ]
      }
    } finally {
      loading = false
      abortController = null
      setTimeout(() => {
        textareaRef?.focus()
      }, 0)
    }
  }

  async function startRecording() {
    try {
      isCancelled = false
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      audioChunks = []

      audioContext = new AudioContext()
      analyser = audioContext.createAnalyser()
      const source = audioContext.createMediaStreamSource(stream)
      source.connect(analyser)
      analyser.fftSize = 2048

      const options = { mimeType: 'audio/webm;codecs=opus' }
      mediaRecorder = new MediaRecorder(stream, options)

      mediaRecorder.ondataavailable = (event: BlobEvent) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop())
        if (audioContext) {
          audioContext.close()
          audioContext = null
        }
        if (silenceTimeout) {
          clearTimeout(silenceTimeout)
          silenceTimeout = null
        }

        if (isCancelled || audioChunks.length === 0) {
          console.log('Recording cancelled, no audio to process')
          isCancelled = false
          return
        }

        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' })
        console.log('Audio recorded:', audioBlob.size, 'bytes')

        await handleTranscription(audioBlob)
      }

      mediaRecorder.start()
      isRecording = true
      console.log('Recording started')

      detectSilence()
    } catch (err) {
      console.error('Microphone error:', err)
      if (err instanceof Error && err.name === 'NotAllowedError') {
        alert(
          'Permission refusée. Autorisez le microphone dans les paramètres.',
        )
      } else {
        alert("Impossible d'accéder au microphone: " + (err as Error).message)
      }
    }
  }

  function detectSilence() {
    if (!analyser || !isRecording) return

    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)
    let hasDetectedSpeech = false

    const checkAudio = () => {
      if (!isRecording || !analyser) return

      analyser.getByteTimeDomainData(dataArray)

      let sum = 0
      for (let i = 0; i < bufferLength; i++) {
        const value = (dataArray[i] ?? 128) - 128
        sum += value * value
      }
      const rms = Math.sqrt(sum / bufferLength)

      if (rms > 3) {
        hasDetectedSpeech = true
        if (silenceTimeout) {
          clearTimeout(silenceTimeout)
          silenceTimeout = null
        }
      } else if (hasDetectedSpeech) {
        if (!silenceTimeout) {
          silenceTimeout = window.setTimeout(() => {
            if (isRecording) {
              console.log('Silence detected, stopping recording')
              stopRecording()
            }
          }, 1500)
        }
      }

      if (isRecording) {
        requestAnimationFrame(checkAudio)
      }
    }

    checkAudio()
  }

  function stopRecording() {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop()
      isRecording = false
      isProcessing = true
      console.log('Recording stopped')
    }
  }

  function cancelRecording() {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      isCancelled = true
      const tracks = mediaRecorder.stream.getTracks()
      tracks.forEach(track => track.stop())
      mediaRecorder.stop()
      isRecording = false
      audioChunks = []
      if (audioContext) {
        audioContext.close()
        audioContext = null
      }
      if (silenceTimeout) {
        clearTimeout(silenceTimeout)
        silenceTimeout = null
      }
      console.log('Recording cancelled')
      setTimeout(() => {
        textareaRef?.focus()
      }, 0)
    }
  }

  async function handleTranscription(audioBlob: Blob) {
    try {
      console.log('Transcribing...')
      const result: TranscriptionResponse = await transcribeAudio(audioBlob)
      const transcription: string = result.text.trim()

      console.log('Transcription:', transcription)

      if (transcription) {
        input = transcription
        isProcessing = false
        await sendMessage()
      } else {
        isProcessing = false
        console.log('No text detected in transcription')
        setTimeout(() => {
          textareaRef?.focus()
        }, 0)
      }
    } catch (err) {
      console.error('Transcription error:', err)
      isProcessing = false
      alert('Erreur de transcription: ' + (err as Error).message)
      setTimeout(() => {
        textareaRef?.focus()
      }, 0)
    }
  }

  function handleVoiceClick() {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }

  function resetChat() {
    messages = []
    input = ''
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }
</script>

<div class="llm-chat-panel" class:open={isOpen}>
  <div class="chat-header">
    <button
      class="model-selector"
      onclick={() => (showModelMenu = !showModelMenu)}
    >
      <span class="model-name">{selectedModel.name}</span>
      <i class="fa-solid fa-chevron-down" class:rotated={showModelMenu}></i>
    </button>

    {#if showModelMenu}
      <div class="model-menu" use:clickOutside={() => (showModelMenu = false)}>
        {#each models as model (model.id)}
          <button
            class="model-option"
            class:selected={model.id === selectedModel.id}
            onclick={() => {
              selectedModel = model
              showModelMenu = false
              Options.set('llmModel', model.id)
            }}
          >
            <div class="model-content">
              <span class="model-name">{model.name}</span>
              <span class="model-description">{model.description}</span>
            </div>
            {#if model.id === selectedModel.id}
              <i class="fa-solid fa-check"></i>
            {/if}
          </button>
        {/each}
      </div>
    {/if}

    <div class="header-actions">
      {#if isConfigured && messages.length > 0}
        <button
          class="new-chat-btn"
          onclick={resetChat}
          aria-label="Nouveau chat"
        >
          <i class="fa-solid fa-plus"></i>
        </button>
      {/if}
      <button
        class="close-btn"
        onclick={() => (isOpen = false)}
        aria-label="Fermer"
      >
        <i class="fa-solid fa-xmark"></i>
      </button>
    </div>
  </div>

  {#if !isConfigured}
    <div class="config-form">
      <div class="config-header">
        <i class="fa-solid fa-key"></i>
        <h3>Configuration</h3>
      </div>
      <p>Enregistrez vos clés API</p>
      <p class="config-note">
        <i class="fa-solid fa-info-circle"></i>
        Les clés sont stockées de manière sécurisée sur votre machine locale
      </p>

      {#if configError}
        <div class="config-message error">
          <i class="fa-solid fa-exclamation-triangle"></i>
          {configError}
        </div>
      {/if}

      {#if configSuccess}
        <div class="config-message success">
          <i class="fa-solid fa-check-circle"></i>
          {configSuccess}
        </div>
      {/if}

      <div class="input-group">
        <label>
          <span>Clé API</span>
          <input
            id="llm-api-key"
            name="apiKey"
            type="password"
            bind:value={apiKey}
            placeholder="Votre clé API"
          />
        </label>

        <label>
          <span>Product ID</span>
          <input
            id="llm-product-id"
            name="productId"
            type="text"
            bind:value={productId}
            placeholder="Votre Product ID"
          />
        </label>
      </div>

      <button
        class="save-btn"
        onclick={saveConfig}
        disabled={!apiKey || !productId}
      >
        <i class="fa-solid fa-check"></i>
        Enregistrer
      </button>
    </div>
  {:else}
    <div class="chat-container-wrapper">
      <div class="fade-top"></div>
      <div class="chat-container" bind:this={chatContainer}>
        {#if messagesWithHtml.length === 0}
          <div class="empty-state">
            <i class="fa-solid fa-comment-dots"></i>
            <p>Posez une question sur les données</p>
            <div class="privacy-note">
              <i class="fa-solid fa-shield-halved"></i>
              <span
                ><a
                  href="https://www.infomaniak.com/fr/hebergement/ai-services"
                  target="_blank"
                  rel="noopener noreferrer">Infomaniak Suisse</a
                >
                • IA souveraine et open source</span
              >
            </div>
          </div>
        {/if}

        {#each messagesWithHtml as message, i (i)}
          <div class="message {message.role}">
            {#if message.role === 'user'}
              <div class="user-bubble">
                <div class="message-content">{message.content}</div>
              </div>
            {:else}
              <div
                class="message-content markdown"
                use:safeHtml={message.html ?? ''}
              ></div>
            {/if}
          </div>
        {/each}
      </div>
      <div class="fade-bottom"></div>
    </div>

    <div class="chat-input">
      <div class="input-wrapper">
        <textarea
          id="llm-chat-input"
          name="chatInput"
          bind:this={textareaRef}
          bind:value={input}
          onkeydown={handleKeyDown}
          oninput={() => {
            if (textareaRef) {
              textareaRef.style.height = 'auto'
              textareaRef.style.height = `${textareaRef.scrollHeight}px`
            }
          }}
          placeholder="Posez votre question..."
          disabled={loading || isRecording || isProcessing}
          rows="1"
        ></textarea>
        <div class="input-buttons">
          {#if isRecording}
            <button
              type="button"
              onclick={handleVoiceClick}
              aria-label="Arrêter l'enregistrement"
              class="stop-btn"
            >
              <i class="fa-solid fa-stop"></i>
            </button>
            <button
              type="button"
              onclick={cancelRecording}
              aria-label="Annuler"
              class="cancel-btn"
            >
              <i class="fa-solid fa-xmark"></i>
            </button>
          {:else if isProcessing}
            <button
              type="button"
              class="voice-btn processing"
              disabled
              aria-label="Traitement en cours"
            >
              <i class="fa-solid fa-spinner fa-spin"></i>
            </button>
          {:else if loading}
            <button
              type="button"
              onclick={() => abortController?.abort()}
              aria-label="Arrêter"
              class="stop-btn"
            >
              <i class="fa-solid fa-stop"></i>
            </button>
          {:else}
            <button
              type="button"
              class="voice-btn"
              onclick={handleVoiceClick}
              disabled={loading}
              aria-label="Reconnaissance vocale"
            >
              <i class="fa-solid fa-microphone"></i>
            </button>
            <button
              type="button"
              class="send-btn"
              onclick={sendMessage}
              disabled={!input.trim()}
              aria-label="Envoyer"
            >
              <i class="fa-solid fa-paper-plane"></i>
            </button>
          {/if}
        </div>
      </div>
    </div>
  {/if}
</div>

<style lang="scss">
  @use 'main.scss' as *;

  .llm-chat-panel {
    position: fixed;
    right: 0;
    top: 0;
    bottom: 0;
    width: var(--chat-panel-width);
    background: $background-2;
    display: flex;
    flex-direction: column;
    z-index: 100;
    border-left: 1px solid $color-5;
    overflow: hidden;
    transform: translateX(100%);
    transition: transform 0.3s ease;

    &.open {
      transform: translateX(0);
    }
  }

  .chat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 1.5rem;
    background: $background-1;
    position: relative;
    height: 47px;

    .model-selector {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 0.75rem;
      margin: 0;
      background: transparent;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: background 0.15s ease;

      &:hover {
        background: rgba($color-3, 0.1);
      }

      .model-name {
        font-size: 1rem;
        font-weight: 600;
        color: $color-1;
      }

      i {
        font-size: 0.75rem;
        color: $color-4;
        transition: transform 0.2s ease;

        &.rotated {
          transform: rotate(180deg);
        }
      }
    }

    .model-menu {
      position: absolute;
      top: 100%;
      left: 1.5rem;
      background: $background-2;
      border-radius: $rounded;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
      z-index: 1001;
      min-width: 320px;
      max-height: 500px;
      overflow-y: auto;

      .model-option {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.75rem 1rem;
        background: transparent;
        border: none;
        width: 100%;
        cursor: pointer;
        transition: background 0.15s ease;
        text-align: left;

        &:hover {
          background: rgba($color-3, 0.1);
        }

        &.selected {
          background: rgba($color-3, 0.15);
        }

        .model-content {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .model-name {
          font-size: 0.95rem;
          font-weight: 600;
          color: $color-1;
        }

        .model-description {
          font-size: 0.8rem;
          color: $color-2;
          opacity: 0.8;
        }

        i {
          color: $color-3;
          font-size: 0.9rem;
          flex-shrink: 0;
        }
      }
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .new-chat-btn {
      background: none;
      border: none;
      cursor: pointer;
      padding: 0.5rem;
      width: 36px;
      height: 36px;
      margin: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 6px;
      color: $color-2;
      transition: all 0.2s;

      i {
        font-size: 1.1rem;
      }

      &:hover {
        background: $background-3;
        color: $color-3;
      }
    }

    .close-btn {
      background: none;
      border: none;
      cursor: pointer;
      padding: 0.5rem;
      width: 36px;
      height: 36px;
      margin: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 6px;
      color: $color-2;
      transition: all 0.2s;

      i {
        font-size: 1.25rem;
      }

      &:hover {
        background: $background-3;
        color: $color-3;
      }
    }
  }

  .chat-container-wrapper {
    flex: 1;
    position: relative;
    overflow: hidden;
    background: $background-1;
  }

  .fade-top,
  .fade-bottom {
    position: absolute;
    left: 0;
    right: 0;
    height: 40px;
    pointer-events: none;
    z-index: 10;
  }

  .fade-top {
    top: 0;
    background: linear-gradient(to bottom, $background-1 0%, transparent 100%);
  }

  .fade-bottom {
    bottom: 0;
    background: linear-gradient(to top, $background-1 0%, transparent 100%);
  }

  .chat-container {
    height: 100%;
    padding: 1.5rem;
    overflow-y: auto;
    background: $background-1;
    display: flex;
    flex-direction: column;
    gap: 1rem;

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-thumb {
      background: $color-5;
      border-radius: 3px;
    }
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    padding: 3rem 1rem;
    text-align: center;
    color: $color-4;

    i {
      font-size: 3rem;
      opacity: 0.5;
    }

    p {
      margin: 0;
      font-size: 0.95rem;
    }

    .privacy-note {
      font-size: 0.75rem;
      color: $color-4;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.4rem;
      margin-top: 0.5rem;

      i {
        font-size: 0.85rem;
      }

      a {
        color: $color-4;
        text-decoration: none;
        border-bottom: 1px solid transparent;
        transition: all 0.2s;

        &:hover {
          color: $color-3;
          border-bottom-color: $color-3;
        }
      }
    }
  }

  .config-form {
    flex: 1;
    padding: 2rem 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    background: $background-1;

    .config-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.5rem;

      i {
        font-size: 1.5rem;
        color: $color-3;
      }

      h3 {
        margin: 0;
        color: $color-2;
        font-size: 1.2rem;
        font-weight: 600;
      }
    }

    p {
      margin: 0;
      color: $color-2;
      opacity: 0.8;
      font-size: 0.95rem;
      line-height: 1.5;
    }

    .config-note {
      padding: 0.75rem 1rem;
      background: rgba($color-3, 0.1);
      border-radius: 0.5rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.85rem;

      i {
        color: $color-3;
      }
    }

    .config-message {
      padding: 0.75rem 1rem;
      border-radius: 0.5rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.9rem;

      &.error {
        background: rgba(#e74c3c, 0.1);
        color: #e74c3c;
        border: 1px solid rgba(#e74c3c, 0.3);
      }

      &.success {
        background: rgba(#27ae60, 0.1);
        color: #27ae60;
        border: 1px solid rgba(#27ae60, 0.3);
      }

      i {
        font-size: 1rem;
      }
    }

    .input-group {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    label {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;

      span {
        font-size: 0.9rem;
        font-weight: 600;
        color: $color-2;
      }

      input {
        padding: 0.85rem;
        border: 1px solid $color-5;
        border-radius: 8px;
        font-size: 0.95rem;
        background: $background-2;
        color: $color-1;
        transition: border-color 0.2s;

        &:focus {
          outline: none;
          border-color: $color-3;
          box-shadow: 0 0 0 3px rgba($color-3, 0.1);
        }

        &::placeholder {
          color: $color-4;
        }
      }
    }

    .save-btn {
      padding: 0.85rem 1.5rem;
      background: $color-3;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      font-size: 0.95rem;
      margin-top: 0.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      transition: opacity 0.2s;

      &:hover:not(:disabled) {
        opacity: 0.9;
      }

      &:disabled {
        background: $color-4;
        cursor: not-allowed;
        opacity: 0.6;
      }
    }
  }

  .message {
    padding: 0.5rem;
    animation: slideIn 0.2s ease-out;

    &.user {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
    }

    .user-bubble {
      display: inline-block;
      background: $background-2;
      padding: 0.75rem 1rem;
      border-radius: $rounded;
      max-width: 85%;

      .message-content {
        white-space: pre-wrap;
      }
    }

    .message-content {
      color: $color-1;
      word-wrap: break-word;

      &.markdown {
        :global(p) {
          margin: 0.5em 0;
          &:first-child {
            margin-top: 0;
          }
          &:last-child {
            margin-bottom: 0;
          }
        }

        :global(pre) {
          background: $background-3;
          padding: 0.75rem;
          border-radius: 6px;
          overflow-x: auto;
          margin: 0.75em 0;
          border: 1px solid $color-5;
        }

        :global(code) {
          background: $background-3;
          padding: 0.2em 0.4em;
          border-radius: 4px;
          font-size: 0.9em;
          font-family: 'Courier New', monospace;
        }

        :global(pre code) {
          background: none;
          padding: 0;
          border: none;
        }

        :global(ul),
        :global(ol) {
          padding-left: 2em;
        }

        :global(ul) {
          list-style-type: disc;
        }

        :global(ol) {
          list-style-type: decimal;
        }

        :global(blockquote) {
          border-left: 3px solid $color-3;
          padding-left: 1em;
          margin: 0.75em 0;
          opacity: 0.9;
        }

        :global(a) {
          color: $color-3;
          text-decoration: none;
          border-bottom: 1px solid currentColor;

          &:hover {
            opacity: 0.8;
          }
        }

        :global(h1),
        :global(h2),
        :global(h3) {
          margin: 1em 0 0.5em;
          font-weight: 600;
        }
      }
    }

    &.user {
      background: transparent;
    }

    &.assistant {
      background: transparent;
    }
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .chat-input {
    padding: 0.5rem 1.5rem;
    background: $background-1;

    .input-wrapper {
      position: relative;
      display: flex;
      align-items: flex-end;
    }

    textarea {
      flex: 1;
      padding: 0.75rem 5rem 0.75rem 1rem;
      border: 1px solid transparent;
      border-radius: 24px;
      font-size: 0.95rem;
      font-family: inherit;
      background: $background-2;
      color: $color-1;
      transition: all 0.15s ease;
      line-height: 1.5;
      min-height: 44px;
      max-height: 200px;
      height: 44px;
      resize: none;
      overflow-y: auto;
      field-sizing: content;
      box-sizing: border-box;

      &:focus {
        outline: none;
      }

      &::placeholder {
        color: $color-4;
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        background: rgba($background-3, 0.5);
      }

      &::-webkit-scrollbar {
        width: 6px;
      }

      &::-webkit-scrollbar-thumb {
        background: $color-5;
        border-radius: 3px;
      }
    }

    .input-buttons {
      position: absolute;
      right: 0.25rem;
      bottom: 0;
      top: 0;
      display: flex;
      gap: 0.25rem;
      align-items: center;
      padding: 0.25rem;
    }

    .voice-btn {
      flex-shrink: 0;
      width: 36px;
      height: 36px;
      padding: 0;
      background: transparent;
      color: $color-2;
      border: none;
      border-radius: 50%;
      cursor: pointer;
      transition: all 0.15s ease;
      display: flex;
      align-items: center;
      justify-content: center;

      i {
        font-size: 1.1rem;
      }

      &:hover:not(:disabled) {
        background: rgba($color-3, 0.1);
      }

      &.processing {
        background: #f59e0b;
        color: white;
      }

      &:disabled {
        cursor: not-allowed;
        opacity: 0.4;
      }
    }

    .stop-btn,
    .cancel-btn {
      flex-shrink: 0;
      width: 36px;
      height: 36px;
      padding: 0;
      background: #ef4444;
      color: white;
      border: none;
      border-radius: 50%;
      cursor: pointer;
      transition: all 0.15s ease;
      display: flex;
      align-items: center;
      justify-content: center;

      i {
        font-size: 1.1rem;
      }

      &:hover {
        background: #dc2626;
      }
    }

    .send-btn {
      flex-shrink: 0;
      width: 36px;
      height: 36px;
      padding: 0;
      padding-top: 2px;
      padding-right: 2px;
      background: $color-3;
      color: white;
      border: none;
      border-radius: 50%;
      cursor: pointer;
      transition: all 0.15s ease;
      display: flex;
      align-items: center;
      justify-content: center;

      i {
        font-size: 0.9rem;
      }

      &:hover:not(:disabled) {
        opacity: 0.9;
        transform: scale(1.05);
      }

      &:active:not(:disabled) {
        transform: scale(0.95);
      }

      &:disabled {
        background: $color-4;
        cursor: not-allowed;
        opacity: 0.4;
      }
    }
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.7;
    }
  }

  :global(body.small-mobile) {
    .llm-chat-panel {
      left: 0;
      width: 100%;
      border: 0;
      top: calc(3.25rem + 116px);
    }
  }
</style>
