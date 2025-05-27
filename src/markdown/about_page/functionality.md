## Navigation

datannur facilite la recherche et la navigation au sein de vos collections de données grâce à une interface à la fois intuitive et performante. Chaque élément (dossier, dataset, variable, etc.) dispose d’un lien unique et d’une page dédiée, offrant un accès direct à ses informations. Les pages sont structurées en plusieurs onglets, dont le contenu est généralement présenté sous forme de tableau pour une visualisation claire et organisée.

![Dossier SITG – Onglet dataset](assets/about_page/dossier_sitg_tab_dataset{dark_mode}.webp?v=1)

### Recherche

La barre de recherche permet de trouver rapidement les éléments dont le nom ou la description correspondent à l’expression saisie. Une page dédiée affiche les résultats de manière claire et organisée. Par défaut, les recherches les plus récentes sont également mises en avant pour un accès rapide.

![Homepage - Onglet à propos - Bar de recherche active](assets/about_page/homepage_search_bar{dark_mode}.webp?v=1)

![Page de recherche](assets/about_page/search_page{dark_mode}.webp?v=1)

### Filtre

Les tableaux offrent des options de filtrage avancées pour chacune de leurs colonnes, permettant des recherches plus spécifiques et précises que celles réalisées via la barre de recherche. Vous pouvez combiner plusieurs filtres pour affiner vos résultats.

Par défaut, un filtre affiche les résultats contenant l’expression indiquée. Cependant, vous pouvez utiliser des symboles spéciaux pour des recherches plus complexes :

- \> : Plus grand que ...
- < :	Plus petit que ...
- = :	contient exactement ...
- ! :	ne contient pas ...
- ="" :	ne contient rien
- !""	: ne contient pas rien

![Onglet datasets avec deux filtres actifs](assets/about_page/datasets_tab_filter{dark_mode}.webp?v=1)

Un filtre global est également disponible au niveau du catalogue. Il permet d’inclure ou d’exclure certains types de datasets, comme :
- Open data et Closed data
- Données brutes et données propres

![Filtre global](assets/about_page/main_filter{dark_mode}.webp?v=1)

### Tri

Les tableaux offrent la possibilité de trier les données en ordre ascendant ou descendant en cliquant simplement sur l’en-tête de la colonne souhaitée. Ce tri peut être combiné avec les options de filtrage des colonnes pour affiner encore davantage l’analyse des données.

![Tri du tableau](assets/tuto/datasets_tab_sort{dark_mode}.gif?v=1)

### Arborescence

datannur repose sur une structure arborescente pour organiser trois concepts clés : les institutions, les dossiers et les mots clés. Chaque élément peut contenir un sous-élément, lui-même pouvant inclure d’autres niveaux, sans limite de profondeur.

Par exemple l’institution "Administration fédérale (AF)" contient le "Département fédéral de l’intérieur (DFI)", qui inclut l’"Office fédéral de la statistique (OFS)". L’OFS est à son tour subdivisé en divisions, elles-mêmes regroupant des sections et des collaborateurs. 

Cette hiérarchie est fidèlement représentée dans le catalogue. Pour chaque élément, il est possible de visualiser :
- Son contenu : les sous-éléments qu’il contient.
- Son contexte : les éléments qui l’incluent.

Chaque élément de l’arborescence dispose d’une page dédiée, qui agit comme un sous-ensemble du catalogue. Par exemple, la page de l’OFS affichera, dans l’onglet "datasets", tous les datasets liés à cette institution. En revanche, la page de la Division Économie de l’OFS ne contiendra que les datasets propres à cette division.

La structure arborescente se combine parfaitement avec les outils de filtrage et de tri des tableaux. Cette synergie offre une expérience de navigation et de recherche à la fois simple et puissante.



![Page à propos – Organisation : vision d’ensemble](assets/about_page/about_page_diagramm{dark_mode}.webp?v=1)

## Information

Chaque page dédiée à un élément du catalogue dispose d’un onglet « À propos » qui présente ses principaux attributs. Cet onglet contient :

- Des informations spécifiques : comme la description (pouvant être formatée en Markdown), la date de mise à jour d’un dataset, ou l’email de contact d’une institution.
- Ses éléments parents : tels que les mots clés associés, le dossier auquel il appartient, ainsi que son fournisseur et gestionnaire (institution).

Dans les autres onglets de la page, vous retrouverez les éléments contenus par cet élément, comme les datasets, variables ou modalités associées.

![Dataset Communes Suisses – Onglet à propos](assets/about_page/dataset_list_histo{dark_mode}.webp?v=1)

### Doc

Un élément particulier du catalogue est la doc (documentation). Il peut s’agir d’un fichier au format PDF ou Markdown (comme un fichier README, par exemple). Les principaux éléments du catalogue peuvent être associés à une ou plusieurs docs, qui sont directement accessibles depuis leur page dédiée. Cela permet de fournir des informations complémentaires ou des explications détaillées sur ces éléments.

![Doc tourisme en Markdown](assets/about_page/doc_tourisme{dark_mode}.webp?v=1)

### Dépendances (lineage)

Pour chaque variable, un tableau dédié affiche ses liens de dépendance avec d’autres variables du catalogue. Deux types de relations sont distingués :  
- Sources (↑) : variables utilisées pour calculer la variable affichée.  
- Dérivées (↓) : variables qui utilisent la variable affichée comme entrée.

Le nombre de sources et de dérivées est indiqué, et chaque lien donne accès à la variable correspondante.  
Ces liens permettent également d’inférer automatiquement les dépendances entre jeux de données : chaque dataset affiche ainsi les autres jeux de données dont ses variables dépendent ou qu’il alimente.

![Page variable - Onglet dépendances](assets/about_page/variable_page_lineage_tab{dark_mode}.webp?v=1)

### Résumé statistique

L’onglet « Stat » propose un résumé statistique des informations issues des autres onglets. Il présente un aperçu des principaux attributs, tels que le nombre de variables par dataset ou les mots clés associés aux dossiers.

Pour chaque attribut, les données sont visualisées à l’aide de graphiques en barres, avec des totaux et des pourcentages. Une échelle logarithmique est utilisée pour les éléments numériques, permettant une meilleure lisibilité des écarts importants.

![Dossier Genève – Onglet stat](assets/about_page/stat_tab{dark_mode}.webp?v=1)

### Aperçu des données

Pour les jeux de données compatibles, un onglet dédié propose un aperçu sous forme de tableau. Cet aperçu permet d’explorer rapidement les données grâce aux fonctions intégrées de tri et de filtre.

![Dataset Communes Suisses – Onglet aperçu](assets/about_page/dataset_histo_commune_preview{dark_mode}.webp?v=1)

### Modalités similaires

L’harmonisation des modalités au sein d’une collection de jeux de données peut être complexe. Pour faciliter cette tâche, la page dédiée aux modalités propose un onglet qui liste les modalités en fonction de leur score de similarité. Cette fonctionnalité permet d’identifier rapidement les doublons ou les doublons partiels, aidant ainsi à uniformiser les données plus efficacement.

![Page modalités - Onglet similitudes](assets/about_page/modality_compare{dark_mode}.webp?v=1)

### Évolution

L’onglet « Évolution » présente l’historique des modifications apportées. Il affiche les ajouts, suppressions et modifications effectués sur les éléments du catalogue. Chaque action est accompagnée d’un horodatage et permet de suivre l’évolution des données au fil du temps.

![Onglet évolution](assets/about_page/evolution_tab{dark_mode}.webp?v=1)

## Utilisation

Les données d’utilisation sont stockées directement dans le navigateur. Par conséquent, le catalogue est pleinement fonctionnel sans connexion internet. Les éléments mis en favoris, les recherches, les logs et les préférences peuvent être exportées et importées à tout moment.

Les données d’utilisation sont stockées localement dans le navigateur, ce qui permet au catalogue de fonctionner sans connexion internet. Les éléments mis en favoris, les recherches, les journaux (logs) et les préférences peuvent être exportés ou importés à tout moment.

### Mise en favoris

Tous les éléments du catalogue peuvent être ajoutés aux favoris en cliquant sur l’icône étoile. Une page dédiée permet ensuite de consulter ces favoris, avec des onglets spécifiques pour chaque type d’élément.

![Onglet dossier – ajout d’un élément en favoris](assets/tuto/add_favorite{dark_mode}.gif?v=2)

![Page favoris](assets/about_page/favorite_page{dark_mode}.webp?v=1)

### Personnalisation

La page de configuration est divisée en plusieurs onglets. Le premier regroupe les options liées à l’interface, comme le mode sombre, le niveau d’arborescence affiché et d’autres paramètres visuels. Il permet également de réinitialiser les données d’utilisation, telles que les favoris, les recherches, les préférences et les journaux (logs).

Un autre onglet est consacré aux logs d’utilisation, regroupant les actions effectuées dans le catalogue (pages consultées, recherches, favoris) ainsi qu’un résumé statistique pour analyser ces données de manière synthétique.

![Page options](assets/about_page/options{dark_mode}.webp?v=1)

### Téléchargement

Les données d’utilisation, enregistrées dans le navigateur, peuvent être exportées ou importées à tout moment sous forme de fichier compressé (ZIP).

Chaque tableau du catalogue peut également être téléchargé en cliquant sur l’icône de nuage située à droite du tableau. Vous avez le choix entre copier les données dans le presse-papier, les télécharger au format CSV ou au format Excel (XLSX).

![Page datasets - téléchargement](assets/tuto/datasets_download{dark_mode}.gif?v=1)

### Vue interne

datannur se distingue par sa simplicité et sa transparence, permettant à l’utilisateur de garder un contrôle total sur ses données. Une vue interne, intégrée au catalogue, offre la possibilité de visualiser comment les métadonnées sont structurées et organisées. En quelque sorte, c’est le catalogue appliqué à lui-même, offrant un aperçu direct de sa propre base de données interne.
