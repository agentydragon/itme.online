import { space } from "rdf-namespaces"
import { getUrlOne } from "@inrupt/solid-client";

import { useProfile, useEnsured } from "./"

export function usePostsContainerUri(webId, path = 'public') {
  const { profile } = useProfile(webId)
  const storageContainer = profile && getUrlOne(profile, space.storage)
  return useEnsured(storageContainer && `${storageContainer}${path}/posts/`)
}

export function useImagesContainerUri(webId, path = 'private') {
  const { profile } = useProfile(webId)
  const storageContainer = profile && getUrlOne(profile, space.storage)
  return useEnsured(storageContainer && `${storageContainer}${path}/images/`)
}