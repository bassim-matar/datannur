<script lang="ts">
  import { chatStream } from '@llm/llm-client'
  import { transcribeAudio, stopChromeRecognition } from '@llm/stt-client'
  import { getToolDefinitions, executeTool } from '@llm/llm-tools'
  import {
    isProxyAvailable,
    checkProxyStatus,
    isLocalProxy,
    createSession,
  } from '@llm/llm-config'
  import markdownRender from '@lib/markdown'
  import Options from '@lib/options'
  import {
    viewportManager,
    chatPanelWidth,
    windowBreakpoints,
    windowWidth,
  } from '@lib/viewport-manager'
  import type { ChatMessage } from '@llm/llm-client'
  import type { TranscriptionResponse } from '@llm/stt-client'
  import modelsConfig from './models.json'
  import sttEnginesConfig from './stt-engines.json'
  import systemInstructions from './prompt/system-instructions.md?raw'
  import toolsGuidelines from './prompt/tools-guidelines.md?raw'
  import schemaDoc from './prompt/schema.md?raw'
  import LLMConfigForm from '@llm/LLMConfigForm.svelte'
  import LLMDropdownSelector from '@llm/LLMDropdownSelector.svelte'
  import LLMChatMessage from '@llm/LLMChatMessage.svelte'

  let {
    isOpen = $bindable(false),
    isProxyUp = $bindable(false),
  }: {
    isOpen?: boolean
    isProxyUp?: boolean
  } = $props()

  let messages = $state<ChatMessage[]>([])
  let input = $state('')
  let loading = $state(false)
  let abortController = $state<AbortController | null>(null)

  let isConfigured = $state(false)
  let isSessionReady = $state(false)
  let isCreatingSession = $state(false)

  let isRecording = $state(false)
  let isProcessing = $state(false)
  let isCancelled = $state(false)
  let voiceConversationMode = $state(false)
  let mediaRecorder = $state<MediaRecorder | null>(null)
  let audioChunks: Blob[] = []
  let silenceTimeout: number | null = null
  let audioContext: AudioContext | null = null
  let analyser: AnalyserNode | null = null
  let chatContainer = $state<HTMLElement | null>(null)
  let textareaRef = $state<HTMLTextAreaElement | null>(null)
  let shouldAutoScroll = $state(true)
  let chatPanelRef = $state<HTMLElement | null>(null)
  let lastAssistantMessageRef = $state<HTMLElement | null>(null)
  let lastAssistantMessageHeight = $state(0)
  let chatContainerHeight = $state(0)

  let placeholderText = $derived.by(() => {
    if (isRecording) return '🎤 Enregistrement en cours...'
    if (isProcessing) return '⏳ Transcription en cours...'
    if (voiceConversationMode) return '🎙️ Mode conversation vocale actif'
    return 'Posez votre question...'
  })

  type SelectableItem = { id: string; name: string; description: string }
  const models = modelsConfig as SelectableItem[]
  let selectedModel = $state(models[0])

  const sttEngines = sttEnginesConfig as SelectableItem[]
  let selectedSTT = $state(sttEngines[0])

  Options.loaded.then(() => {
    const savedModelId = Options.get('llmModel') as string | undefined
    if (savedModelId) {
      const model = models.find(m => m.id === savedModelId)
      if (model) selectedModel = model
    }

    const savedSTTId = Options.get('sttEngine') as string | undefined
    if (savedSTTId) {
      const stt = sttEngines.find(s => s.id === savedSTTId)
      if (stt) selectedSTT = stt
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

  let isExecutingTool = $derived.by(() => {
    if (!loading) return false
    const lastMsg = messages[messages.length - 1]
    return (
      lastMsg?.role === 'assistant' &&
      lastMsg.tool_calls &&
      lastMsg.tool_calls.length > 0
    )
  })

  $effect(() => {
    checkConfiguration().catch(console.error)
  })

  // Create session only when chat is opened (avoids Turnstile noise at startup)
  let sessionCreated = false
  $effect(() => {
    if (isOpen && isConfigured && !isLocalProxy() && !sessionCreated) {
      sessionCreated = true
      isCreatingSession = true
      createSession()
        .then(success => {
          isSessionReady = success
        })
        .catch(() => {
          isSessionReady = false
        })
        .finally(() => {
          isCreatingSession = false
        })
    }
    // For local proxy, session is always ready
    if (isLocalProxy() && isConfigured) {
      isSessionReady = true
    }
  })

  $effect(() => {
    let width = 0
    const currentWindowWidth = $windowWidth
    if (isOpen) {
      if (currentWindowWidth <= windowBreakpoints.smallMobile) {
        width = currentWindowWidth
      } else {
        width = chatPanelWidth as number
      }
    }
    viewportManager.setChatWidth(width)
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

  $effect(() => {
    if (shouldAutoScroll && chatContainer && loading) {
      requestAnimationFrame(() => {
        if (chatContainer) {
          chatContainer.scrollTop = chatContainer.scrollHeight
        }
      })
    }
  })

  $effect(() => {
    if (!chatContainer) return

    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        chatContainerHeight = entry.contentRect.height
      }
    })

    observer.observe(chatContainer)

    return () => {
      observer.disconnect()
    }
  })

  $effect(() => {
    if (!lastAssistantMessageRef) return

    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        lastAssistantMessageHeight = entry.contentRect.height
      }
    })

    observer.observe(lastAssistantMessageRef)

    return () => {
      observer.disconnect()
    }
  })

  let spacerHeight = $derived(
    Math.max(0, chatContainerHeight - lastAssistantMessageHeight - 130),
  )

  function handleScroll(): void {
    if (!chatContainer) return
    const threshold = 100
    const isNearBottom =
      chatContainer.scrollHeight -
        chatContainer.scrollTop -
        chatContainer.clientHeight <
      threshold
    shouldAutoScroll = isNearBottom
  }

  /**
   * Build complete system prompt for LLM
   * Includes: instructions, current context, schema, and tools guidelines
   */
  function buildSystemPrompt() {
    const now = new Date()
    const dateOnly = now.toISOString().split('T')[0] // YYYY-MM-DD only for cache stability

    return `# datannur data catalog assistant

Current date: ${dateOnly}

${systemInstructions}

${schemaDoc}

${toolsGuidelines}`
  }

  async function checkConfiguration(): Promise<void> {
    if (!isProxyAvailable()) {
      isProxyUp = false
      isConfigured = false
      return
    }

    const status = await checkProxyStatus()
    isProxyUp = status.available
    isConfigured = status.configured
  }

  async function sendMessage() {
    if (!input.trim() || loading) return

    const userMessage: ChatMessage = { role: 'user', content: input }
    messages = [...messages, userMessage]
    input = ''

    if (textareaRef) {
      textareaRef.style.height = 'auto'
    }

    loading = true
    shouldAutoScroll = true
    lastAssistantMessageHeight = 0
    abortController = new AbortController()
    const currentAbortController = abortController

    const assistantMessage: ChatMessage = { role: 'assistant', content: '' }
    messages = [...messages, assistantMessage]

    const maxMessages = 20
    if (messages.length > maxMessages) {
      messages = messages.slice(-maxMessages)
    }

    try {
      const systemMessage: ChatMessage = {
        role: 'system',
        content: buildSystemPrompt(),
      }

      // Agent loop: continue while there are tool calls
      let continueLoop = true
      let loopCount = 0
      const maxLoops = 10 // Safety limit
      let hadToolCall = false

      while (continueLoop && loopCount < maxLoops) {
        loopCount++
        hadToolCall = false
        const currentMessages = [systemMessage, ...messages.slice(0, -1)]
        const tools = getToolDefinitions()

        console.log(
          '[DEBUG] Sending messages:',
          currentMessages.length,
          'messages',
        )
        console.log(
          '[DEBUG] System prompt tokens est:',
          Math.ceil(systemMessage.content.length / 4),
        )
        console.log(
          '[DEBUG] Total chars:',
          currentMessages.reduce((sum, m) => sum + m.content.length, 0),
        )
        console.log(
          '[DEBUG] Tools definitions tokens est:',
          Math.ceil(JSON.stringify(tools).length / 4),
        )

        await chatStream(
          currentMessages,
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
          {
            model: selectedModel.id,
            signal: currentAbortController.signal,
            tools,
            onToolCall: async toolCall => {
              try {
                hadToolCall = true
                console.log(
                  '[Tool Call] Calling tool:',
                  toolCall.function.name,
                  'with args:',
                  toolCall.function.arguments,
                )
                const toolArgs = JSON.parse(
                  toolCall.function.arguments,
                ) as Record<string, unknown>
                const result = await executeTool(
                  toolCall.function.name,
                  toolArgs,
                )
                console.log('[Tool Call] Result:', result)

                // Update assistant message with tool_calls
                const lastAssistantIndex = messages.length - 1
                messages = [
                  ...messages.slice(0, lastAssistantIndex),
                  {
                    ...messages[lastAssistantIndex]!,
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    tool_calls: [toolCall],
                  },
                ]

                // Add tool result message
                messages = [
                  ...messages,
                  {
                    role: 'tool',
                    content: JSON.stringify(result),
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    tool_call_id: toolCall.id,
                    name: toolCall.function.name,
                  },
                ]

                // Add new assistant message for next iteration
                messages = [
                  ...messages,
                  {
                    role: 'assistant',
                    content: '',
                  },
                ]
              } catch (toolError) {
                console.error('Tool execution error:', toolError)
                messages = [
                  ...messages,
                  {
                    role: 'assistant',
                    content: `Erreur lors de l'exécution de l'outil: ${toolError instanceof Error ? toolError.message : String(toolError)}`,
                  },
                ]
                continueLoop = false
              }
            },
          },
        )

        // Check if we should continue looping
        const lastMsg = messages[messages.length - 1]

        // If we had a tool call AND the message already has content, stop (parallel tool calling worked!)
        if (hadToolCall && lastMsg?.role === 'assistant' && lastMsg.content) {
          continueLoop = false
        }
        // Continue if we had a tool call without content (need to get LLM response to the tool result)
        else if (hadToolCall) {
          continueLoop = true
        }
        // Stop if last message has content (LLM generated a text response)
        else if (lastMsg?.role === 'assistant' && lastMsg.content) {
          continueLoop = false
        }
        // Stop if last message is assistant without tool_calls (shouldn't happen but safety check)
        else if (lastMsg?.role === 'assistant' && !lastMsg.tool_calls) {
          continueLoop = false
        }
      }

      if (loopCount >= maxLoops) {
        console.warn('[Agent Loop] Max iterations reached')
      }
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
      if (voiceConversationMode) {
        setTimeout(() => {
          startRecording()
        }, 500)
      } else {
        setTimeout(() => {
          textareaRef?.focus()
        }, 0)
      }
    }
  }

  async function startRecording() {
    if (selectedSTT.id === 'chrome-native') {
      await startChromeNativeRecording()
    } else {
      await startWhisperRecording()
    }
  }

  async function startChromeNativeRecording() {
    try {
      isRecording = true
      isProcessing = false
      console.log('Starting Chrome native speech recognition')

      const result: TranscriptionResponse = await transcribeAudio(
        new Blob(),
        'chrome-native',
      )
      const transcription: string = result.text.trim()

      console.log('Transcription:', transcription)
      isRecording = false

      if (transcription) {
        input = transcription
        await sendMessage()
      } else {
        console.log('No text detected in transcription')
        if (voiceConversationMode) {
          setTimeout(() => {
            startRecording()
          }, 500)
        } else {
          setTimeout(() => {
            textareaRef?.focus()
          }, 0)
        }
      }
    } catch (err) {
      console.error('Chrome native recognition error:', err)
      isRecording = false
      if (voiceConversationMode) {
        setTimeout(() => {
          startRecording()
        }, 500)
      } else {
        alert('Erreur de reconnaissance vocale: ' + (err as Error).message)
        setTimeout(() => {
          textareaRef?.focus()
        }, 0)
      }
    }
  }

  async function startWhisperRecording() {
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
          isCancelled = false
          return
        }

        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' })
        await handleTranscription(audioBlob)
      }

      mediaRecorder.start()
      isRecording = true

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
    }
  }

  function cancelRecording() {
    voiceConversationMode = false

    if (selectedSTT.id === 'chrome-native') {
      stopChromeRecognition()
      isRecording = false
      return
    }

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
      setTimeout(() => {
        textareaRef?.focus()
      }, 0)
    }
  }

  async function handleTranscription(audioBlob: Blob) {
    try {
      const result: TranscriptionResponse = await transcribeAudio(
        audioBlob,
        selectedSTT.id as 'whisper' | 'chrome-native',
      )
      const transcription: string = result.text.trim()

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
      voiceConversationMode = false
      if (selectedSTT.id === 'chrome-native') {
        stopChromeRecognition()
        isRecording = false
      } else {
        stopRecording()
      }
    } else {
      voiceConversationMode = true
      startRecording()
    }
  }

  function exitVoiceMode() {
    voiceConversationMode = false
    if (isRecording) {
      if (selectedSTT.id === 'chrome-native') {
        stopChromeRecognition()
        isRecording = false
      } else {
        cancelRecording()
      }
    }
  }

  function resetChat() {
    messages = []
    input = ''
    voiceConversationMode = false
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }
</script>

<div class="llm-chat-panel" class:open={isOpen} bind:this={chatPanelRef}>
  <div class="chat-header">
    <LLMDropdownSelector
      icon="fa-robot"
      items={models}
      bind:selected={selectedModel}
      optionKey="llmModel"
    />

    <LLMDropdownSelector
      icon="fa-microphone"
      items={sttEngines}
      bind:selected={selectedSTT}
      optionKey="sttEngine"
      menuPosition="center"
    />

    <div class="header-actions">
      {#if isConfigured && messages.length > 0}
        {#if voiceConversationMode}
          <button
            class="exit-voice-btn"
            onclick={exitVoiceMode}
            aria-label="Quitter mode vocal"
          >
            <i class="fa-solid fa-microphone-slash"></i>
          </button>
        {:else}
          <button
            class="new-chat-btn use-tooltip"
            onclick={resetChat}
            aria-label="Nouveau chat"
            title="Nouveau chat"
          >
            <i class="fa-solid fa-pen-to-square"></i>
          </button>
        {/if}
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
    <LLMConfigForm onConfigured={() => (isConfigured = true)} />
  {:else}
    <div class="chat-container-wrapper">
      <div
        class="chat-container"
        bind:this={chatContainer}
        onscroll={handleScroll}
      >
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

        <div>
          {#each messagesWithHtml as message, i (i)}
            {#if message.role === 'user'}
              <LLMChatMessage role="user" content={message.content} />
            {:else if message.role === 'tool'}
              <LLMChatMessage
                role="tool"
                content={message.content}
                name={message.name}
              />
            {:else if message.role === 'assistant' && !message.tool_calls && message.content}
              <LLMChatMessage
                role="assistant"
                content={message.content}
                html={message.html}
                bind:elementRef={lastAssistantMessageRef}
              />
            {/if}
          {/each}

          {#if isExecutingTool}
            <div class="message assistant">
              <div class="tool-indicator">
                <i class="fa-solid fa-database"></i>
                <span>Interrogation de la base de données...</span>
              </div>
            </div>
          {/if}

          {#if loading && !isExecutingTool && messagesWithHtml.length > 0 && !messagesWithHtml[messagesWithHtml.length - 1]?.content}
            <div class="message assistant">
              <div class="loading-indicator">
                <div class="loading-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          {/if}
        </div>

        {#if messages.length > 0}
          <div
            class="dynamic-spacer"
            style="min-height: {spacerHeight}px;"
          ></div>
        {/if}
      </div>
    </div>

    <div class="chat-input">
      {#if isCreatingSession}
        <div class="session-loading">
          <div class="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <span>Vérification en cours...</span>
        </div>
      {:else if !isSessionReady && !isLocalProxy() && isConfigured}
        <div class="session-error">
          <i class="fa-solid fa-exclamation-triangle"></i>
          <span
            >Impossible de créer la session. Veuillez recharger la page.</span
          >
        </div>
      {:else}
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
            placeholder={placeholderText}
            disabled={isRecording || isProcessing}
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
                disabled={!input.trim() || loading}
                aria-label="Envoyer"
              >
                <i class="fa-solid fa-paper-plane"></i>
              </button>
            {/if}
          </div>
        </div>
      {/if}
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
    overscroll-behavior: contain;

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
    z-index: 1;
    box-shadow: 0 8px 8px $background-1;

    .header-actions {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .exit-voice-btn {
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
        background: rgba(#ef4444, 0.1);
        color: #ef4444;
      }
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

  .chat-container {
    height: 100%;
    padding: 1.5rem;
    overflow-y: auto;
    background: $background-1;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    overscroll-behavior: contain;

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

  .dynamic-spacer {
    min-height: 50vh;
    flex-shrink: 0;
  }

  .message {
    padding: 0 0.5rem;
    margin-bottom: 0;
    animation: slideIn 0.2s ease-out;

    &.assistant {
      background: transparent;
    }

    .tool-indicator {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 0.75rem;
      background: $background-2;
      border-radius: $rounded;
      color: $color-3;
      font-size: 0.9em;
      opacity: 0.8;
      animation: pulse 1.5s ease-in-out infinite;

      i {
        font-size: 0.85em;
      }
    }

    .loading-indicator {
      display: flex;
      align-items: center;
      padding: 0.5rem 0.75rem;

      .loading-dots {
        display: flex;
        gap: 0.4rem;

        span {
          width: 8px;
          height: 8px;
          background: $color-3;
          border-radius: 50%;
          animation: bounce 1.4s ease-in-out infinite;

          &:nth-child(1) {
            animation-delay: 0s;
          }

          &:nth-child(2) {
            animation-delay: 0.2s;
          }

          &:nth-child(3) {
            animation-delay: 0.4s;
          }
        }
      }
    }
  }

  @keyframes bounce {
    0%,
    80%,
    100% {
      transform: translateY(0);
      opacity: 0.4;
    }
    40% {
      transform: translateY(-10px);
      opacity: 1;
    }
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 0.6;
    }
    50% {
      opacity: 1;
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

    .session-loading,
    .session-error {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      padding: 1rem;
      color: $color-3;
      font-size: 0.9rem;
    }

    .session-error {
      color: #e67e22;
      i {
        font-size: 1.1rem;
      }
    }

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

  :global(body.window-small-mobile) {
    .llm-chat-panel {
      left: 0;
      width: 100%;
      border: 0;
      top: calc(3.25rem + 116px);
      border-top: 1px solid $color-5;
      border-top-left-radius: $rounded;
      border-top-right-radius: $rounded;
    }
  }
</style>
