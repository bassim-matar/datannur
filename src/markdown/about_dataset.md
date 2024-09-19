Un dataset représente une table de base de données ou un fichier de données (excel, csv, ...) sous forme de tableau (lignes et colonnes).

Un dataset contient des variables (colonnes du tableau ou attributs de la table).
Il peut être contenu dans un seul dossier mais il peut avoir une multitude de mot clés associés à lui.
Il peut être géré par un gestionnaire (institution) et être fourni par un fournisseur (institution).
Une multitude de docs peuvent lui être associé.

mermaid(
  $folder $recursive
  $institution $recursive
  $tag $recursive
  $institution -- manager - owner --> $dataset
  $folder --> $dataset
  $tag <--> $dataset
  $dataset <--> $doc 
  $dataset --> $variable
);
