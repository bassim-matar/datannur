Une doc (documentation) peut être un fichier de type PDF ou Markdown (format utilisé pour les readme).

Elle peut être associée à une multitude d'institutions, de dossiers et de datasets, et inversement.

mermaid(
  $doc <--> $institution
  $doc <--> $folder
  $doc <--> $dataset
);
