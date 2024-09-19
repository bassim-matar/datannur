Les dossiers permettent de regrouper et organiser les jeux de données en une arborescence. 

Un dossier peut être indiqué comme étant géré par une institution, et des mots clés peuvent lui être attribué.

mermaid(
  $folder $recursive
  $institution $recursive
  $tag $recursive
  $institution -- manager - owner --> $folder
  $tag <--> $folder
  $folder --> $dataset
  $folder --> $modality
);