<script>
  import { entity_names } from "@js/constant"
  import Icon from "@layout/Icon.svelte"
  import Breadcrumb from "@component/Breadcrumb.svelte"
  import ExtendableText from "@layout/ExtendableText.svelte"

  export let institution_id
  export let type = "institution"
  export let is_self = false

  let name = entity_names[type]
  let icon = "institution"
  if (is_self) {
    name = "Partie de"
    icon = "folder_tree"
  }
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
