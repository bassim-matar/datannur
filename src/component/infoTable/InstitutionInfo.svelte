<script>
  import { entity_names } from "@js/constant"
  import Icon from "@layout/Icon.svelte"
  import Breadcrumb from "@component/Breadcrumb.svelte"
  import ExtendableText from "@layout/ExtendableText.svelte"

  let { institution_id, type = "institution", is_self = false } = $props()

  const name = is_self ? "Partie de" : entity_names[type]
  const icon = is_self ? "folder_tree" : "institution"
</script>

{#if institution_id}
  <tr>
    <td><Icon type={icon} /> {name}</td>
    <td>
      <ExtendableText>
        <Breadcrumb
          className="tree"
          type="institution"
          elem_id={institution_id}
          {is_self}
        />
      </ExtendableText>
    </td>
  </tr>
{/if}
