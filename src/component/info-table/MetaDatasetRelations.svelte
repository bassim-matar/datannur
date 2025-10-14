<script lang="ts">
  import db from '@db'
  import Icon from '@layout/Icon.svelte'
  import Link from '@layout/Link.svelte'

  let { datasetId }: { datasetId: string } = $props()

  interface Alias {
    alias: string
    name: string
    entity: string
  }

  interface RelationType {
    name: 'oneToOne' | 'oneToMany' | 'manyToMany'
    symbol: string
    tooltip: string
  }

  interface RelationGroup {
    type: RelationType
    relations: [string, string][]
  }

  const schema = db.getSchema()

  const relationTypes: RelationType[] = [
    { name: 'oneToOne', symbol: 'minus', tooltip: 'one to one' },
    { name: 'oneToMany', symbol: 'arrow-right-long', tooltip: 'one to many' },
    {
      name: 'manyToMany',
      symbol: 'arrows-left-right',
      tooltip: 'many to many',
    },
  ]

  const aliases: Alias[] = []
  for (const relation of schema.oneToOne) {
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

  let datasetHasAlias = aliases.some(alias => alias.entity === datasetId)

  const relations: RelationGroup[] = relationTypes.map(type => ({
    type,
    relations: schema[type.name].filter(relation => {
      if (datasetHasAlias) {
        if (type.name === 'oneToOne' && relation.includes(datasetId))
          return false

        for (const alias of aliases) {
          if (relation.includes(alias.alias)) {
            return true
          }
        }
      }
      if (relation.includes(datasetId)) return true
      return false
    }) as [string, string][],
  }))

  for (const relationType of relations) {
    for (const relation of relationType.relations) {
      for (const alias of aliases) {
        if (relation[0] === alias.alias) {
          relation[0] = alias.name
        } else if (relation[1] === alias.alias) {
          relation[1] = alias.name
        }
      }
    }
  }

  const hasRelation = relations.some(
    relationType => relationType.relations.length > 0,
  )
</script>

{#if hasRelation}
  <tr>
    <td><Icon type="relation" /> Relations</td>
    <td>
      {#each relations as relationType (relationType.type.name)}
        {#if relationType.relations.length}
          <ul>
            {#each relationType.relations as relation (relation)}
              <li>
                <Link href={`metaDataset/${relation[0].split(' (')[0]}`}
                  >{relation[0]}</Link
                >
                <span class="use-tooltip" title={relationType.type.tooltip}>
                  <Icon type={relationType.type.symbol} marginRight={false} />
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
