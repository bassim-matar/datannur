# datannur

## unreleased

- fixed : git language stats with correct gitattributes

## 0.9.2 (2024-11-02)

- added : tag doc
- added : table input filter ="" and !"" for empty and not empty
- added : md to json.js conversion
- changed : header favorite btn without name and scrollbar min width larger
- changed : dont use indexdb encryption by default
- changed : harmonize variable naming in search_history indexdb data
- changed : make datatables column width not reduce width when no result
- changed : refactor datatable js code to extract js code in separate files
- fixed : ellipsis on extendable tree on entity info page
- fixed : git language stats in app (build) repo to include assets md, js and css files

## 0.9.1 (2024-10-29)

- added : doc description
- added : filter infobox visible on mobile
- changed : center vertically datatables rows content
- changed : migrate all svelte code to version 5
- fixed : tabs body overflow hidden when not datatables
- fixed : extendable text in tab info default 2 lines visible
- fixed : scroll bar page body during tab transition
- fixed : nb doc max for percent bar in datatable
- removed : default bulma css

## 0.9.0 (2024-10-23)

- changed : use specific icon for preview
- changed : use two rows for datatables and make column fixed width
- fixed : remove stat tab menu border on dark mode
- fixed : remove mouse cursor when datatables not clickable
- fixed : tab nb item update from child component with store
- fixed : move worker logic in js file
- fixed : page option btn icon margin

## 0.8.17 (2024-10-20)

- added : more console log duration during init process 
- added : special error page for when error during init process
- added : deep level info on entity page
- changed : put footer inside menu in mobile version
- changed : migrate to svelte 5 with minimal changes
- changed : put deep level and favorite at the end of the table
- changed : use always absolute deep level and nevel relative for column level
- fixed : tabs_body overflow hidden only when not datatables, so download button is still visible
- fixed : add old variable name only to variable name in search module
- fixed : keep footer in menu for mobile version
- fixed : force input on metaDataset datetime column

## 0.8.16 (2024-10-17)

- added : some screenshot for about page
- changed : get last modification timestamp directly from jsonjsdb instead of info file
- changed : get filter and alias info from config file instead of filter and alias files
- changed : upgrade to sass 1.80.1
- changed : put icons in icon folder
- changed : use replaceAll instead of replace when needed (not regex)
- changed : about fonctionality now use new screen shot all light and dark mode
- fixed : typo in about_meta
- fixed : doc preview a pixel to height
- fixed : tabs_body overflow hidden without hidding the download button
- fixed : jsonjsdb dont update last modification when no change

## 0.8.15 (2024-10-16)

- added : metaDataset last_update info
- added : footer last update info live updated
- added : about functionality tab
- changed : make datatables not stretch to 100% width and remove header border
- changed : use __meta_schema__ instead of other meta files
- changed : complete __meta_schema__ variable and remove virtual table
- changed : center option tab section
- changed : make tab body max height dynamic and always apply
- fixed : update jsonjsdb with little fix for empty ids
- fixed : jsonjsdb types not imported
- removed : jsonjsdb metaDataset virtual table for many to many relation

## 0.8.14 (2024-10-11)

- added : jsonjsdb can normalize db schema
- changed : use tab for about page
- changed : rename preview file and md file, move md jsonjs in db
- changed : use md doc from db based on doc id
- changed : markdown many to many relation entity order from main to secondary
- changed : denormalize db schema to remove many to many relation table
- fixed : footer vue meta highlight on metavariable page
- fixed : entity icon in title centered on mobile when no favorite
- fixed : vue meta variable nb value link and value preview
- removed : readme folder attribut, icon and color

## 0.8.13 (2024-10-07)

- added : about tab for search page
- changed : click on header logo from homepage make tab change to default tab
- changed : adapt switch "show all recursive" to fit aside and be always present when needed
- fixed : update to latest datatables version after bug fixed with fixedcolumns 5.0.3
- fixed : table select input with null option changed to empty string
- fixed : adapt test to new page url with more realistic data

## 0.8.12 (2024-10-03)

- added : demo dataset with lot of variable to test datatables scroller
- fixed : revert datatables to version 2.1.4 to fix bug with fixed col and scroller
- fixed : upgrade sass without warning about new JS API
- fixed : loading logo centered
- fixed : remove errors when dataset has no folder or institution
- changed : dont make static page for variable and modality
- changed : make demo data more realistic and complete
- refactor : use Column.nb_child_recursive() and Column.nb_variable()

## 0.8.11 (2024-09-26)

- added : link to release on github when clicking on app version in footer
- added : github links to the source code in footer 
- changed : remove some config files and integrate them in package.json and vite.config.js
- changed : remove pdf version of the license in the root and move it in public/assets
- fixed : enable again shortcut that open link in new tab and fix go back to homepage
- fixed : error 404 page link to homepage

## 0.8.10 (2024-09-23)

- added : support mermaid in all markdown about tab
- changed : refactor mermaid loading
- changed : improve about tab for all pages
- changed : make image in about tab full width
- fixed : add line break between about main body and more info
- fixed : make main_banner src dynamic in Main.svelte

## 0.8.9 (2024-09-18)

- changed : mermaid version from 9.3 to 11.2 (latest)
- changed : migrate scss @import to @use
- changed : make about_main internal markdown with optional custom parts
- changed : move main_banner in assets folder
- fixed : typo in License with the licensor name
- fixed : overlap between exporter btn, search bar and open_all btn on mobile

## 0.8.8 (2024-09-16)

- added : modality description in table modalities
- changed : use internal markdown files instead of config.xlsx for about tab
- fixed : search highlight html entities with empty search
- fixed : search bar debounce sync highlight and result
- fixed : search bar remove recent search btn
- fixed : search bar colspan diff with recent search

## 0.8.7 (2024-09-15)

- added : License in pdf format
- changed : use navigo router lib instead of page.js
- changed : Improve readme formulation and links
- changed : License now in first stable version

## 0.8.6 (2024-09-04)

- added : app/readme to the file to update
- added : dataset delivery_format
- fixed : tab title initial width too large on static page
- fixed : typo in about page
- fixed : tag level on tab tag page dataset

## 0.8.5 (2024-08-28)

- added : changelog file
- added : update_app.json with param to choose version
- added : app readme
- changed : db_source/config.xlsx section about_main
- changed : markdown link highlight
