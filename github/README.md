# this folder contains scripts related to setting up github actions for CI/CD

# preparations 

- in the github folder, copy variables.env.example to variables.env and fill in the missing values
- get the publishsettings for the webapp (from azure) and save them as production.PublishSettings in the github folder (see example.PublishSettings)

- use the install-gh.sh script to install the github commandline tool

# adding secrets to the repository and enabling actions

- from the root folder run 

```
bash github/setup-actions.sh
```

now check the variables in the script output 

#changing the database url separately

```
gh variable set DATABASE_URL --body "connection string"

cd azure
bash az-login.sh
bash az-app-restart.sh
```