set -a
source .env
set +a

# use --no-cache (after build arg to force a furebuild of the image
docker build \
  --build-arg NEXT_PUBLIC_API_BASE_URL="$NEXT_PUBLIC_API_BASE_URL" \
  --build-arg NEXT_PUBLIC_WEB_BASE_URL="$NEXT_PUBLIC_WEB_BASE_URL" \
  --build-arg DATABASE_URL="$DATABASE_URL" \
  --build-arg NEXTAUTH_SECRET="$NEXTAUTH_SECRET" \
  --build-arg NEXTAUTH_URL="$NEXTAUTH_URL" \
  --build-arg NEXT_PUBLIC_MAPBOX_TOKEN="$NEXT_PUBLIC_MAPBOX_TOKEN" \
  --build-arg LOGINTOKEN_SIGNER_PRIVATE_KEY="$LOGINTOKEN_SIGNER_PRIVATE_KEY" \
  -t nextjs-docker .
