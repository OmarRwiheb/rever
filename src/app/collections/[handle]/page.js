import CollectionClient from './CollectionClient';

export default async function Page({ params }) {
  // params.handle is guaranteed here on the server
  const { handle } = await params;
  return <CollectionClient handle={handle} />;
}
