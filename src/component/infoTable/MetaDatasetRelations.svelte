<script>
  import db from "@db"
  import Icon from "@layout/Icon.svelte"
  import Link from "@layout/Link.svelte"

  let { dataset_id } = $props()

  const relation_types = [
    { name: "one_to_one", symbol: "---", tooltip: "one to one" },
    { name: "one_to_many", symbol: "-->", tooltip: "one to many" },
    { name: "many_to_many", symbol: "<-->", tooltip: "many to many" },
  ]

  const aliases = []
  for (const relation of db.tables.__schema__.one_to_one) {
    for (const alias of db.tables.__schema__.aliases) {
      if (relation[0] === alias) {
        aliases.push({
          alias: relation[0],
          name: relation[1] + ` (${relation[0]})`,
          entity: relation[1],
        })
      }
    }
  }

  let dataset_has_alias = aliases.some(alias => alias.entity === dataset_id)

  const relations = relation_types.map(type => ({
    type,
    relations: db.tables.__schema__[type.name].filter(relation => {
      if (dataset_has_alias) {
        if (type.name === "one_to_one" && relation.includes(dataset_id))
          return false

        for (const alias of aliases) {
          if (relation.includes(alias.alias)) {
            return true
          }
        }
      }
      if (relation.includes(dataset_id)) return true
      return false
    }),
  }))

  for (const relation_type of relations) {
    for (const relation of relation_type.relations) {
      for (const alias of aliases) {
        if (relation[0] === alias.alias) {
          relation[0] = alias.name
        } else if (relation[1] === alias.alias) {
          relation[1] = alias.name
        }
      }
    }
  }

  const has_relation = relations.some(
    relation_type => relation_type.relations.length > 0,
  )
</script>

{#if has_relation}
  <tr>
    <td><Icon type="relation" /> Relations</td>
    <td>
      {#each relations as relation_type}
        {#if relation_type.relations.length}
          <ul>
            {#each relation_type.relations as relation}
              <li>
                <Link href={`metaDataset/${relation[0].split(" (")[0]}`}
                  >{relation[0]}</Link
                >
                <span class="use_tooltip" title={relation_type.type.tooltip}>
                  {relation_type.type.symbol}
                </span>
                <Link href={`metaDataset/${relation[1].split(" (")[0]}`}
                  >{relation[1]}</Link
                >
              </li>
            {/each}
          </ul>
        {/if}
      {/each}
    </td>
  </tr>
{/if}
