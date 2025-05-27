Les variables sont spécifiques à un dataset. 
Elles peuvent être liées à une ou plusieurs modalités. 
Des mots clés peuvent lui être attribué.
Les variables peuvent également être liées à d’autres variables, en tant que sources ou dérivées (lineage).

mermaid( 
  $dataset --> $variable
  $variable <--> $modality
  $variable <--> $tag
  $variable <-- source - dérivé --> $variable
);
