url_encode() {
    local input="$1"
    # Print each character, converting non-alphanumeric characters to %hex
    printf "%s" "$input" | xxd -p | sed 's/\(..\)/%\1/g' | tr -d '\n'
}

source ./.env

# special characters in password need to be encoded, otherwise the prisma command will fail
export DATABASE_URL="mysql://veiligstallen_readwrite:$(url_encode $PASSWORD)@127.0.0.1:5555/veiligstallen"

read -p "Read the prisma schema from the remote database? This will overwrite the manual edits in the schema file. (yes/no): " response
if [ "$response" != "yes" ]; then
    echo "Operation cancelled. Exiting."
else
    echo "Pulling the prisma schema from the remote database..."
    npx prisma db pull --force
    echo "Prisma schema updated."
    echo "!!!! You need to reapply the manual edits in the schema file before running npx prisma generate. !!!!"

    read -p "Execute prisma generate to update the prisma client? (yes/no): " response
    if [ "$response" != "yes" ]; then
        echo "Client not updated. Exiting."
    else
        npx prisma generate
        echo "Client updated."
    fi
fi

unset DATABASE_URL
unset PASSWORD