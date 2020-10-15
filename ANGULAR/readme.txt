

- Angular app is a set of modules.
	Code starts from main.ts
		platformBrowserDynamic().bootstrapModule(AppModule)
		(we import AppModule)

- A MODULE is a collection of components, and providers (services)
	> @NgModule [declarations, imports, providers, bootstrap, exports]
    > One of the module contains the key "bootstrap" and defines the component which will act as main()
	> We need to define bootstrap to actually start the actual component (sort of "main")
	> DECLATRATIONS: The list of components which will be compiled
	> IMPORTS: The imports will only be linked.
	> PROVIDERS: services

- Component controls the VIEW.
  	> @Component [selector, templateURL, styleURls, providers]
  	> PROVIDERs will be used here for getting data from database
  	> The instance variables of component are visible in view {{varName}}.
  	> We use () to register html events like "click" (event-binding)


- SERVICES: For DATA or LOGIC that isn't associated with a specific view, we use services.
	> @Injectable


========================================
DATA EXCHANGE within a component:
========================================
- To exchange data within a components (between TS and HTML), we have:
  > From TS -> HTML, we can get data in {{}}
  > To get data from HTML, one option is to get data in events functions e.g. onSelect(hero)
  
- NGMODEL, used for 2 way databinding
 > [(ngModel)]  

- NGFor: Repeates the components code
  > *ngFor = "let hero of heros"

========================================
DATA EXCHANGE across components:
========================================
- Services for data exchange among siblings / unrelated components
- Input to pass data to child (parent-child as defined in DOM)
- Output to pass data to parent (parent-child as defined in DOM)





