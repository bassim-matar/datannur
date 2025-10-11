Les dossiers permettent de regrouper et organiser les datasets et les modalités en une arborescence.

Un dossier peut être indiqué comme étant géré et/ou fourni par une institution, des mots clés et des docs peuvent lui être attribués.

mermaid(
$folder $recursive
$institution -- manager - owner --> $folder
$folder --> $dataset
$folder --> $modality
$folder <--> $tag
$folder <--> $doc
);
