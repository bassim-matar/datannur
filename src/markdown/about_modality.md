Une modalité contient une multitude de valeurs.
Elle est contenu dans un dossier et peut être liée par une multitude de variable de différents datasets.
Une variable peut également être liée à plusieurs modalités (contenant des valeurs différentes).

mermaid(
  $folder --> $modality
  $variable <--> $modality
  $modality --> $value
);
