## Navigation

datannur permet de rechercher et naviguer dans les informations de vos collections de données de façon simple et puissante. Chaque élément (dossier, dataset, variable, …) possède un lien et une page dédiée. Chaque page contient plusieurs onglets, dont le contenu est généralement présenté sous forme de tableau.

![datannur screen_shot](assets/about_page/dossier_sitg_tab_dataset_lm-2.png)

### Recherche

La barre de recherche et sa page consacrée affichent les éléments dont le nom ou la description contiennent l’expression recherchée. Les recherches les plus récentes s’affichent par défaut.

![datannur screen_shot](assets/about_page/search_page_lm-v2.png)


### Filtre

Les tableaux peuvent être filtrés au niveau de chacune de leurs colonnes, ce qui permet des recherches plus spécifiques et précises que via la barre de recherche. Plusieurs filtres peuvent être utilisés conjointement. Par défaut, un filtre affiche les résultats contenant l’expression indiquée, mais des symboles spéciaux permettent d’autres usages:

- = l’expression complète
- ! ne contient pas l’expression
- < est plus petit que l’expression (numérique et date)
- > est plus grand que l’expression (numérique et date)

Il existe également un filtre global au niveau du catalogue afin d’inclure ou non certains type de datasets, par exemple Open data et Closed data, ou alors données brutes et données propres.

### Tri

Les tableaux peuvent être triés de façon ascendante ou descendante en cliquant sur la colonne désirée. Le tri est combinable avec le filtrage des colonnes.

### Arborescence

datannur possède trois concepts qui s’organisent de façon arborescente: les institutions, les dossiers et les mots clés. Un dossier peut contenir un sous-dossier, contenant lui même un sous-dossier, etc sans limite de profondeur. Il en va de même pour les institutions et mots clés. Par exemple l’institution « Administration fédérale (AF) » contient « Département fédéral de l’intérieur (DFI) » qui contient « Office fédéral de la statistique (OFS) ». l’OFS est elle-même constituée de divisions regroupant des sections rassemblant des collaborateurs.

Cette structure arborescente est parfaitement restituée dans le catalogue. Pour chaque élément, il est aisé de connaître ce qu’il contient et ce qui le contient. Chaque page d’un élément d’une arborescence est un sous ensemble du catalogue. Par exemple, sur la page de l’OFS, l’onglet dataset affiche tous les datasets de l’institution, alors que la page de la Division Economie de l’OFS ne contiendra que les datasets de cette division.

L’arborescence, le filtrage et le tri des tableaux sont utilisables conjointement pour offrir une expérience de recherche et de navigation simple et puissante.


![datannur screen_shot](assets/about_page/about_page_diagramm_dm.webp)


## Information

Sur chaque page dédiée à un élément du catalogue, l’onglet « A propos » affiche ses différents attributs. Par exemple la description (qui peut être formatée en markdown) et d’autres informations spécifiques, comme la date de mise à jour pour un dataset, ou l’email de contact pour une institution. C’est également dans cet onglet que l’on trouve les éléments contenants ou parents, comme les mots clés, le dossier ou encore le fournisseur et le gestionnaire (institution). Dans les autres onglets, les éléments contenus sont listés (dataset, variable, etc.).


![datannur screen_shot](assets/about_page/dataset_list_histo_lm.webp)


### Doc

Un élément particulier est la doc (documentation). Il peut s’agir d’un fichier au format pdf ou au format markdown (un readme par exemple). Les principaux éléments du catalogue peuvent avoir des docs qui leur sont attachées et qui peuvent être directement consultées depuis le catalogue.

### Résumé statistique

Un onglet, « Stat », affiche les informations des autres onglets sous forme de résumé statistique au niveau de certains attributs. Par exemple le nombre de variable par dataset, ou encore les mots clés attachés aux dossiers. Pour chaque attribut, un graphique en bar avec totaux et pourcentages est affiché, avec une échelle logarithmique pour les éléments numériques.


![datannur screen_shot](assets/about_page/stat_tab_lm.webp)


### Aperçu des données

Pour les jeux de données qui s’y prêtent, un onglet affiche un aperçu sous forme de tableau avec les fonctions de tri et de filtre.

### Modalités similaires

L’harmonisation des modalités au sein d’une collection de jeux de données n’est pas toujours facile. C’est pourquoi, sur la page dédiée aux modalités, un onglet affiche les modalités par score de similarité entre elles. Cela aide à repérer les doublons ou doublons partiels.

## Utilisation

Les données d’utilisation sont stockées directement dans le navigateur. Par conséquent, le catalogue est pleinement fonctionnel sans connexion internet. Les éléments mis en favoris, les recherches, les logs et les préférences peuvent être exportées et importées à tout moment.

### Mise en favoris

Tous les éléments peuvent être mis en favoris en cliquant sur l’étoile. Une page permet ensuite de les lister. avec un onglet dédié à chaque type d’élément.

![add_favorite](assets/tuto/add_favorite{dark_mode}.gif?v=1)

![datannur screen_shot](assets/about_page/favorite_page_dm.webp)


### Personnalisation

Une page de configuration est divisée en plusieurs onglets. Le premier regroupe les différentes options au niveau de l’interface (dark mode, niveau d’arborescence affiché, et autres éléments visuels), la possibilité de réinitialiser des données d’utilisation comme les favoris, les recherches, les préférences de configuration et les logs. Un onglet est consacré aux logs d’utilisation du catalogue (pages et onglets consultés, recherches effectuées, mises en favoris, …). Un autre onglet affiche le résumé statistique des logs.

### Téléchargement

A tout moment les données d’utilisation, stockées dans le navigateur, peuvent être téléchargées ou chargées à partir d’un fichier zip contenant plusieurs fichiers au format JSON. De plus, chaque tableau affiché dans le catalogue peut être téléchargé de trois façons, en cliquant sur le nuage à droite du tableau :

copie dans le presse-papier (copier-coller)
téléchargement en CSV
téléchargement en XLSX

### Vue interne

datannur est simple et transparent afin que l’utilisateur puisse toujours avoir le contrôle sur ses données. Une vue interne au catalogue permet de voir comment les métadonnées sont organisées. C’est l’application du catalogue à lui même, sur sa base de données interne.
