## Organisation

datannur contient 7 concepts principaux. On peut les diviser en deux catégories, partie intérieur et partie extérieur aux datasets. Le **dataset** représente une table de base de données ou un fichier de données (excel, csv, ...) sous forme de tableau (lignes et colonnes).

mermaid( 
  $dataset -.-> intérieur
  $dataset -.-> extérieur
);


### Intérieur du dataset

#### Dataset
Un dataset contient des variables (colonnes du tableau ou attributs de la table). Une variable est une liste de valeurs qui varie en fonction des individus ou lignes du tableau.

mermaid( $dataset --> $variable );

#### Variable
Certaines variables sont de type catégoriel et peuvent être liées à une modalité, c'est à dire un ensemble de valeurs possibles. Une même modalité peut être liée à plusieurs variables de différents datasets. Une même variable peut être liée à plusieurs modalités.

mermaid( $variable <--> $modality );

#### Modalité
Une modalité contient des valeurs possibles. Une valeur comprend optionnellement une description. 

mermaid( $modality --> $value );


### Extérieur du dataset

#### Dossier
Un dataset ou une modalité peut être contenu dans un dossier. Un dossier peut lui aussi être contenu dans un autre dossier et ainsi de suite, formant ainsi une arborescence.

mermaid(
  $folder $recursive
  $folder --> $dataset
  $folder --> $modality
);

#### Institution
Un dataset ou un dossier peut avoir un fournisseur et un gestionnaire. Il s'agit de deux rôles incarnés par une institution. Une institution peut être contenue dans une autre institution et ainsi de suite, de façon similaire aux dossiers.

mermaid(
  $institution $recursive
  $institution -- manager - owner --> $folder
  $institution -- manager - owner --> $dataset
);

#### Mot clé
Un dataset, un dossier ou une institution peuvent être liés à un ou plusieurs mots clés. Un mot clé peut être lié à une multitude de variables, de datasets, de dossiers et d'institutions. Un mot clé peut être contenu dans un autre mot clé et ainsi de suite, de façon similaire aux dossiers et aux institutions.

mermaid(
  $tag $recursive
  $institution <--> $tag
  $folder <--> $tag
  $dataset <--> $tag
  $variable <--> $tag
  $tag <--> $doc
);

#### Doc
Pour finir, certains concepts possèdent des docs (documentations de type markdown ou pdf). Une doc peut être liée à une multitude de datasets, de dossiers et d'institutions, et inversement.

mermaid(
  $institution <--> $doc
  $folder <--> $doc
  $tag <--> $doc
  $dataset <--> $doc
);


### Vision d'ensemble

Voici les liens entre les 7 concepts, à l'intérieur et l'extérieur des datasets.

mermaid(
  $folder $recursive
  $institution $recursive
  $tag $recursive
  $institution -- manager - owner --> $dataset
  $institution -- manager - owner --> $folder
  $institution <--> $tag
  $institution <--> $doc
  $folder --> $dataset
  $folder --> $modality
  $folder <--> $tag
  $folder <--> $doc
  $tag <--> $doc
  $dataset --> $variable
  $dataset <--> $tag
  $dataset <--> $doc
  $variable <--> $modality
  $variable <--> $tag
  $modality --> $value
);
