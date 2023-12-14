REPOSITORY=mosbuma/fietsberaad-veiligstallen-app

#publish or update the workflow variables
gh variable set -f ./github/variables.env

#publish or update secret azure publish profile (set separately because it is a multiline value)
gh variable set AZUREAPPSERVICE_PUBLISHPROFILE_VEILIGSTALLEN < ./github/production.PublishSettings

#enable the ci/cd action
gh workflow enable azure-webapps-node.yml

gh variable list 
