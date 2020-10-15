# Building and Running On Linux

Before moving to steps ,for installation/building app, Clone repository named 'charms-web-view-v4'
and checkout branch 'multi-clinic-support'.
    
    git clone `repo link`
    git checkout multi-clinic-support

#### Step1:-> Install Nodejs

    sudo apt install nodejs
    sudo apt install npm
    node --version
#### Step2:-> Install Yarn Package Manager
    
    curl -sL https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
    echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
    sudo apt update && sudo apt install yarn
    yarn --version
    
#### Step3:-> Build Project
    run following commands from projects's root folder
    
    yarn
    yarn build-lib
    yarn start-clinic-local


now open browser and go to http://localhost:4200

Note: Chi-Server should be running for this UI to use

Need to build ...



# Build library
- order key in controller config is list now
- btn_text is renamed to btnText