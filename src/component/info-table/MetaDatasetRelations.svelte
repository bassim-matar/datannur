<script lang="ts">
  import db from '@db'
  import Icon from '@layout/Icon.svelte'
  import Link from '@layout/Link.svelte'

  let { dataset_id }: { dataset_id: string } = $props()

  interface Alias {
    alias: string
    name: string
    entity: string
  }

  interface RelationType {
    name: string
    symbol: string
    tooltip: string
  }

  interface RelationGroup {
    type: RelationType
    relations: [string, string][]
  }

  const schema = structuredClone(db.tables.__schema__)

  const relation_types: RelationType[] = [
    { name: 'one_to_one', symbol: 'minus', tooltip: 'one to one' },
    { name: 'one_to_many', symbol: 'arrow-right-long', tooltip: 'one to many' },
    {
      name: 'many_to_many',
      symbol: 'arrows-left-right',
      tooltip: 'many to many',
    },
  ]

  const aliases: Alias[] = []
  for (const relation of schema.one_to_one) {
    for (const alias of schema.aliases) {
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

  const relations: RelationGroup[] = relation_types.map(type => ({
    type,
    relations: schema[type.name].filter(relation => {
      if (dataset_has_alias) {
        if (type.name === 'one_to_one' && relation.includes(dataset_id))
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
      {#each relations as relation_type (relation_type.type.name)}
        {#if relation_type.relations.length}
          <ul>
            {#each relation_type.relations as relation (relation)}
              <li>
                <Link href={`metaDataset/${relation[0].split(' (')[0]}`}
                  >{relation[0]}</Link
                >
                <span class="use_tooltip" title={relation_type.type.tooltip}>
                  <Icon type={relation_type.type.symbol} margin_right={false} />
                </span>
                <Link href={`metaDataset/${relation[1].split(' (')[0]}`}
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
