# this folder contains scripts related to setting up github actions for CI/CD

# overview

In the .github/workflows folder there are two actions scripts that get executed by github when the acceptance of production repository receives updates

These scripts use a number of github variables that are set using the github API. These set the publishing profile for Azure (settings that determine on which web app the deplloyment takes place) and the database connection string.


# preparations 

- in the github folder, copy variables.env.example to variables.env and fill in the missing values
- get the publishsettings for the production webapp (from azure) and save them as production.PublishSettings in the github folder (see example.PublishSettings)
- get the publishsettings for the acceptance webapp (from azure) and save them as acceptance.PublishSettings in the github folder (see example.PublishSettings)

- use the install-gh.sh script to install the github commandline tool

# adding secrets to the repository and enabling actions

- from the root folder run 

```
bash github/setup-actions.sh
```

now check the variables in the script output 

#changing the database url separately

```
gh variable set ACC_DATABASE_URL --body "connection string"
gh variable set PROD_DATABASE_URL --body "connection string"

cd azure
bash az-login.sh
bash az-app-restart.sh
```