import {
  getUrlAll, getUrlOne, getStringNoLocaleOne
} from '@solid/lit-pod'
import auth from "solid-auth-client"
import { foaf, vcard } from "rdf-namespaces"

import useWebId from "~hooks/useWebId"
import useThing from "~hooks/useThing"
import { Flow, Module } from "~components/layout"
import { Button } from "~components/elements"
import { TextField } from "~components/form"
import ProfileModule from "~modules/Profile"
import { otherPath } from "~lib/urls"


function AuthButton() {
  const webId = useWebId()
  if (webId === undefined) {
    return <div>loading...</div>
  } else if (webId === null) {
    return (
      <Button onClick={() => auth.popupLogin({ popupUri: "/popup.html" })}>
        Log In
      </Button>
    )
  } else {
    return <Button onClick={() => auth.logout()}>Log Out</Button>
  }
}

function Friend({ webId, ...rest }) {
  const { thing: profile } = useThing(webId)
  const profileImage = profile && getUrlOne(profile, vcard.hasPhoto)
  const name = profile && getStringNoLocaleOne(profile, foaf.name)
  return (
    <div className="relative col-span-3" {...rest}>
      <a href={otherPath(webId)} >
        <img className="h-16 w-16 color-white overflow-hidden rounded-full"
          alt="profile"
          src={profileImage || '/user.svg'} />
        <div className="p-6 h-16 w-16 top-0 left-0 hover:w-32 hover:h-32 absolute hover:-top-8 hover:-left-8 rounded-full text-center bg-opacity-75 bg-white opacity-0 hover:opacity-100 align-baseline flex flex-column items-center transition-transform duration-100 ease-in-out transform hover:-translate-y-1 hover:scale-110 ">
          <h4>{name}</h4>
        </div>
      </a>
    </div>
  )
}

function Friends() {
  const webId = useWebId()
  const { thing: profile } = useThing(webId)
  const knows = profile && getUrlAll(profile, foaf.knows)
  if (profile) {
    return (
      <div className="absolute inset-0 p-3 grid grid-cols-12">
        {knows && knows.map(url => (
          <Friend webId={url} key={url} />
        ))}
      </div>
    )
  } else {
    return <div>loading...</div>
  }

}


export default () => {
  return (
    <Flow>
      <ProfileModule />
      <Module>
        <Friends />
      </Module>
      <Module>
        <AuthButton />
      </Module>
    </Flow>
  )
}
