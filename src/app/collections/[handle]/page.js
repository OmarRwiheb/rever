import CollectionClient from './CollectionClient';

export default function Page({ params }) {
  // params.handle is guaranteed here on the server
  return <CollectionClient handle={params.handle} />;
}
