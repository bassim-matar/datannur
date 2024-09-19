Une institution représente une personne morale, une de ses composantes ou l'un de ses collaborateurs. Les institutions sont organisées de façon arborescente.

Une institution peut être associée à des datasets et des dossiers, elle peut en avoir le statut de fournisseur et/ou de gestionnaire.

mermaid(
  $institution $recursive
  $institution -- manager - owner --> $folder
  $institution -- manager - owner --> $dataset
);