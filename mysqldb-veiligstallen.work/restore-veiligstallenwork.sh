#!/bin/bash

# Determine the directory of the script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

Prompt for the database password
if [ -f "$SCRIPT_DIR/.env" ]; then
    source "$SCRIPT_DIR/.env"
else
    read -sp ".env file not found. Enter the database password for the restore server: " REMOTE_DB_PASSWORD
    echo
    # Export the password as an environment variable
fi

# Ensure MYSQL_PWD is unset if the script is aborted
trap 'unset MYSQL_PWD' EXIT

# Define the restore server details
RESTORE_DB_HOST=127.0.0.1
RESTORE_DB_PORT=5555

RESTORE_DB_USER=veiligstallen_readwrite
RESTORE_DB_NAME=veiligstallen

restore_structure() {
    local dump_file="./mysqldb-productiondata/export-db-structure.sql"

    if [ ! -f "$dump_file" ]; then
        echo "Structure dump file not found: $dump_file"
        return
    fi

    local start_time=$(date +"%H:%M:%S")
    echo "Restoring database structure from $dump_file at $start_time"
    mysql -h "$RESTORE_DB_HOST" -u "$RESTORE_DB_USER" -P "$RESTORE_DB_PORT" "$RESTORE_DB_NAME" < "$dump_file"
}

restore_tables_individual() {
    local tablelist="$1"

    for table in $tablelist; do
        local dump_file="./mysqldb-productiondata/export-db-${table}.sql"
        
        if [ ! -f "$dump_file" ]; then
            echo "Dump file for table $table not found, skipping: $dump_file"
            continue
        fi

        local start_time=$(date +"%H:%M:%S")
        echo "Restoring table $table from $dump_file at $start_time"
        mysql -h "$RESTORE_DB_HOST" -u "$RESTORE_DB_USER" -P "$RESTORE_DB_PORT" "$RESTORE_DB_NAME" < "$dump_file"
        
        local end_time=$(date +"%H:%M:%S")
        echo "Restoring table $table done at $end_time"
    done
}

# Prompt the user to confirm database deletion
read -p "Do you want to delete the current database before restoring? Type 'yes' to proceed: " confirm_delete

if [ "$confirm_delete" == "yes" ]; then
    echo "Proceeding with database deletion..."
    # Add the command to delete the database here
    # Example: mysql -h "$RESTORE_DB_HOST" -u "$RESTORE_DB_USER" -P "$RESTORE_DB_PORT" -e "DROP DATABASE $RESTORE_DB_NAME;"
else
    echo "Skipping database deletion."
fi

# Restore the database structure
restore_structure

# List of tables to restore
TABLES_ALL="abonnementen abonnementsvorm_fietsenstalling abonnementsvorm_fietstype abonnementsvormen account_transacties accounts accounts_pasids articles articles_templates barcoderegister bezettingsdata_tmp bikeparklog bulkreservering bulkreserveringuitzondering contact_contact contact_fietsenstalling contact_report_settings contacts contacts_faq contacts_fietsberaad documenttemplates externe_apis externe_apis_locaties faq fietsenstalling_plek fietsenstalling_plek_bezetting fietsenstalling_sectie fietsenstalling_sectie_kostenperioden fietsenstallingen fietsenstallingen_services fietsenstallingen_winkansen fietsenstallingtypen fietstypen financialtransactions fmsservice_permit fmsservicelog gemeenteaccounts historischesaldos instellingen klanttypen log lopers loterij_log mailings_lists mailings_members mailings_messages mailings_standaardteksten modules modules_contacts modules_contacts_copy1 plaats_fietstype presentations presentations_ticker prijswinnaars prijswinnaars_backup prijzen prijzenpot producten rapportageinfo schema_version sectie_fietstype sectie_fietstype_tmp security_roles security_users security_users_sites services sleutelhangerreeksen tariefcodes tariefregels tariefregels_copy1 tariefregels_copy2 tariefregels_copy3 tariefregels_copy4 tariefregels_copy5 tariefregels_tmp texts tmp_audit_grabbelton_na tmp_audit_grabbelton_voor transacties_archief_tmp transacties_gemeente_totaal transacties_view trekkingen uitzonderingenopeningstijden unieke_bezoekers users_beheerder_log v_ds_surveyareas_parkinglocations vw_fmsservice_errors vw_locations vw_lopende_transacties vw_pasids vw_stallingstegoeden vw_stallingstegoedenexploitant wachtlijst wachtlijst_fietstype wachtlijst_item wachtrij_betalingen wachtrij_pasids wachtrij_sync winkansen winkansen_reminderteksten winkansen_zelf_inzet transacties_archief webservice_log bezettingsdata transacties emails"

# Restore each table individually
restore_tables_individual "$TABLES_ALL"

echo "Restore complete"
