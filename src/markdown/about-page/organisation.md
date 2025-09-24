datannur repose sur 7 concepts principaux, qui se répartissent en deux catégories :

- Intérieur du dataset : pour les éléments directement liés aux données elles-mêmes
- Extérieur du dataset : pour les éléments qui structurent, organisent ou enrichissent les datasets

mermaid(
$dataset -.-> intérieur
$dataset -.-> extérieur
);

## Intérieur du dataset

### Dataset

Un dataset représente une table de données, qu’il s’agisse d’une base de données ou d’un fichier (Excel, CSV, etc.), organisé sous forme de tableau. Ce tableau est composé de lignes, correspondant aux individus ou observations, et de colonnes, qui sont des variables ou attributs. Chaque variable regroupe une liste de valeurs, qui diffèrent d’un individu à l’autre.

mermaid( $dataset --> $variable );

### Variable

Certaines variables sont de type catégoriel, avec des valeurs possibles définies par une modalité. Une variable peut être liée à plusieurs modalités, et inversement. Chaque variable peut également avoir des données de fréquence associées.

mermaid(
$variable <--> $modality
$variable --> $freq
);

### Fréquence

Les fréquences permettent de comptabiliser le nombre d'occurrences de chaque valeur spécifique au sein d'une variable. Cela offre une vue statistique de la distribution des données et aide à identifier les valeurs les plus communes ou rares. Chaque entrée de fréquence contient une valeur et son nombre d'occurrences.

### Modalité

Une modalité regroupe un ensemble de valeurs possibles pour une ou plusieurs variables catégorielles. Chaque valeur peut être accompagnée d’une description pour en préciser le sens.

mermaid( $modality --> $value );

## Extérieur du dataset

### Dossier

Les datasets et les modalités peuvent être organisés dans des dossiers. Les dossiers peuvent s’imbriquer les uns dans les autres, formant une arborescence hiérarchique pour structurer vos données.

mermaid(
$folder $recursive
$folder --> $dataset
$folder --> $modality
);

### Institution

Un dossier ou un dataset peut être associé à deux types de rôles incarnés par une institution :

- **Fournisseur** : l’entité qui produit ou partage les données
- **Gestionnaire** : l’entité qui les maintient et en garantit la qualité

Les institutions peuvent également s’organiser de manière hiérarchique, en étant contenues les unes dans les autres.

mermaid(
$institution $recursive
$institution -- manager - owner --> $folder
$institution -- manager - owner --> $dataset
);

### Mot clé

Les mots clés servent à enrichir les institutions, dossiers, datasets ou variables avec des thématiques ou des catégories transversales. Un mot clé peut être lié à une multitude d’éléments et peut aussi être organisé en hiérarchie.

mermaid(
$tag $recursive
$institution <--> $tag
$folder <--> $tag
$dataset <--> $tag
$variable <--> $tag
$tag <--> $doc
);

### Doc

Certains concepts peuvent être associés à des documentations (docs) au format Markdown ou PDF. Ces docs permettent de décrire ou expliquer en détail des institutions, dossiers ou datasets. Il peuvent être liées à plusieurs concepts, et inversement.

mermaid(
$institution <--> $doc
$folder <--> $doc
$tag <--> $doc
$dataset <--> $doc
);

## Vision d'ensemble

Les concepts de datannur sont interconnectés, offrant une grande flexibilité pour organiser, enrichir et documenter vos données. Voici comment ils sont reliés :

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
$variable --> $freq
$modality --> $value
);
