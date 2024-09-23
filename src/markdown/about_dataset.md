Un dataset représente une table de base de données ou un fichier de données (excel, csv, ...) sous forme de tableau (lignes et colonnes).

Un dataset contient des variables (colonnes du tableau ou attributs de la table).
Il peut être géré par un gestionnaire (institution) et être fourni par un fournisseur (institution).
Il peut être contenu dans un seul dossier et une multitude de mot clés et de docs peuvent lui être associé.

mermaid(
  $folder $recursive
  $institution $recursive
  $tag $recursive
  $institution -- manager - owner --> $dataset
  $folder --> $dataset
  $tag <--> $dataset
  $doc <--> $dataset
  $dataset --> $variable
);
