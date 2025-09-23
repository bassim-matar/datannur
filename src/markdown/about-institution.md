Une institution représente une personne morale, une de ses composantes ou l'un de ses collaborateurs. Les institutions sont organisées de façon arborescente.

Une institution peut être associée à des dossiers et à des datasets, elle peut en avoir le statut de fournisseur et/ou de gestionnaire.

Une institution peut également avoir des mots clés et des docs.

mermaid(
$institution $recursive
$institution -- manager - owner --> $folder
$institution -- manager - owner --> $dataset
$institution <--> $tag
$institution <--> $doc
);
