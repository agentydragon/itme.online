import { useState, useCallback } from 'react'
import { useAuthentication, useLoggedIn, useMyProfile, useProfile, useWebId, useEnsured } from 'swrlit'
import {
  setStringNoLocale, getStringNoLocale, getUrl, setUrl, createSolid, getThingAll, asUrl,
  getDatetime
} from '@inrupt/solid-client'
import { FOAF, AS, RDF, RDFS, DCTERMS } from '@inrupt/vocab-common-rdf'
import { WS } from '@inrupt/vocab-solid-common'
import { ITME } from "../vocab"
import { useRouter } from 'next/router'
import Link from 'next/link'

import { useConceptIndex } from '../hooks/concepts'
import { useStorageContainer, useFacebabyContainerUri } from '../hooks/uris'
import { conceptNameFromUri } from '../model/concept'
import { profilePath } from '../utils/uris'
import Nav from '../components/nav'
import { Loader } from '../components/elements'
import Notes from '../components/Notes'
import Follows from '../components/Follows'
import Feed from '../components/Feed'
import TabButton from '../components/TabButton'
import { EditIcon } from '../components/icons'

function LoginUI(){
  const [handle, setHandle] = useState("")
  const [badHandle, setBadHandle] = useState(false)
  const [loggingIn, setLoggingIn] = useState(false)
  const { loginHandle, logout } = useAuthentication()
  async function logIn(){
    setBadHandle(false)
    setLoggingIn(true)
    try {
      await loginHandle(handle);
    } catch (e) {
      console.log("error:", e)
      setBadHandle(true)
      setLoggingIn(false)
    }
  }
  function onChange(e){
    setHandle(e.target.value)
    setBadHandle(false)
  }
  function onKeyPress(e){
    if (e.key === "Enter"){
      logIn()
    }
  }
  return (
    <>
      {/*
      <Link href="/register">
        <a className="text-4xl block">create your account</a>
      </Link>
      <h3 className="text-3xl my-6">OR</h3>
      <Link href="/login">
        <a className="text-4xl">get a magic login link</a>
      </Link>
      <h3 className="text-3xl my-6">OR</h3>
      <h3 className="text-3xl mb-3 text-gray-800">login with your handle</h3>
       */}
      <input type="text" className="pl-2 w-2/3 m-auto text-2xl rounded text-center text-black"
             placeholder="what's your handle?"
             value={handle} onChange={onChange} onKeyPress={onKeyPress}/>
      {badHandle && (
        <p className="text-red-500 m-auto mt-2">
          hm, I don't recognize that handle
        </p>
      )}
      {loggingIn ? (
        <Loader className="flex flex-row justify-center"/>
      ) : (
        <button className="btn mt-6 p-3 text-3xl flex-auto block m-auto hover:shadow-md" onClick={logIn}>
          log in
        </button>
      )}
    </>
  )
}

function NewNoteForm(){
  const router = useRouter()
  const [noteName, setNoteName] = useState("")
  const onCreate = useCallback(function onCreate(){
    router.push(`/notes/${encodeURIComponent(noteName)}`)
  })
  return (
    <div className="flex flex-row m-auto my-6">
      <input value={noteName} onChange={e => setNoteName(e.target.value)} className="input-text mr-3" type="text" placeholder="New Note Name" />
      <button className="btn" onClick={onCreate} disabled={noteName === ""}>
        Create Note
      </button>
    </div>
  )
}

function Name({name, save, ...props}){
  const [newName, setNewName] = useState()
  const [editingName, setEditingName] = useState(false)
  function saveName(){
    save(newName)
    setEditingName(false)
  }
  function onEdit(){
    setNewName(name)
    setEditingName(true)
  }
  return (
    <div {...props}>
      {editingName ? (
        <div className="flex flex-row justify-center">
          <input className="text-xl input-text mr-3"
                 value={newName}
                 autoFocus
                 onChange={e => setNewName(e.target.value)} type="text"
                 placeholder="New Name" />
          <button className="btn" onClick={saveName}>
            Set Name
          </button>
        </div>
      ): (
        <div className="relative flex flex-row">
          <h3 className="text-4xl text-center mb-3">{name}</h3>
          <EditIcon className="relative -top-6 text-purple-300 cursor-pointer"
                    onClick={onEdit} />
        </div>
      )}
    </div>
  )
}

function WebMonetizationPointer({profile, save, ...props}){
  const paymentPointer = profile && getStringNoLocale(profile, ITME.paymentPointer)
  const [newPaymentPointer, setNewPaymentPointer] = useState()
  const [editingPaymentPointer, setEditingPaymentPointer] = useState(false)
  function savePaymentPointer(){
    save(newPaymentPointer)
    setEditingPaymentPointer(false)
  }
  function onEdit(){
    setNewPaymentPointer(paymentPointer)
    setEditingPaymentPointer(true)
  }
  return (
    <div {...props}>
      {editingPaymentPointer ? (
        <div className="flex flex-row justify-center">
          <input className="text-xl input-text mr-3"
                 value={newPaymentPointer}
                 autoFocus
                 onChange={e => setNewPaymentPointer(e.target.value)} type="text"
                 placeholder="New Payment Pointer" />
          <button className="btn" onClick={savePaymentPointer}>
            Set PaymentPointer
          </button>
        </div>
      ): (
        <div className="relative flex flex-row">
          <h3 className="text-xl text-center mb-3">
            {paymentPointer || (
              <span className="text-gray-500" onClick={onEdit}>
                click to set payment pointer
              </span>
            )}
          </h3>
          {paymentPointer && (
            <EditIcon className="relative -top-6 text-purple-300 cursor-pointer"
                      onClick={onEdit} />
          )}
        </div>
      )}
    </div>
  )
}

export default function IndexPage() {
  const loggedIn = useLoggedIn()
  const { profile, save: saveProfile } = useMyProfile()
  const name = profile && getStringNoLocale(profile, FOAF.name)
  const profileImage = profile && getUrl(profile, FOAF.img)
  async function onSaveName(newName){
    return await saveProfile(setStringNoLocale(profile, FOAF.name, newName))
  }
  async function onSavePaymentPointer(newPaymentPointer){
    return await saveProfile(setStringNoLocale(profile, ITME.paymentPointer, newPaymentPointer))
  }

  const webId = useWebId()
  const appContainerUri = useFacebabyContainerUri(webId)
  const [tab, setTab] = useState("notes")
  return (
    <div className="page" id="page">
      { (loggedIn === true) ? (
        <>
          <Nav />
        <div className="px-6">
          <div className="flex flex-row py-6 justify-between">
            <div className="flex flex-row">
              {profileImage && <img className="rounded-full h-36 w-36 object-cover mr-12" src={profileImage} /> }
              <div className="flex flex-col mr-12">
                <Name name={name} save={onSaveName}/>
                <WebMonetizationPointer profile={profile} save={onSavePaymentPointer}
                                        className="mt-2"/>
              </div>
            </div>
            <div className="flex flex-col">
              <h5 className="text-xl text-center mb-6">
                <Link href={`${profilePath(webId)}`}>
                  <a>
                    public profile
                  </a>
                </Link>
              </h5>
            </div>
          </div>
          <div className="flex justify-between">
            <div className="mr-6 flex-grow">
              <NewNoteForm />
              <div className="flex mb-6">
                {/*
                <TabButton name="feed" activeName={tab} setTab={setTab}>
                  feed
                </TabButton>
                 */}
                <TabButton name="notes" activeName={tab} setTab={setTab}>
                  notes
                </TabButton>
                <TabButton name="following" activeName={tab} setTab={setTab}>
                  following
                </TabButton>
              </div>
              {tab === "notes" ? (
                <Notes webId={webId}/>
              ) : (tab === "feed" ? (
                <Feed/>
              ) : (tab === "following" ? (
                <Follows />
              ) : (
                <div className="font-logo">
                  you are in a maze of twisty passages, all alike
                </div>
              )
              ))}
            </div>
          </div>
        </div>
          </>
      ) : (
        ((loggedIn === false) || (loggedIn === null)) ? (
            <div className="text-center">
              <div className="my-12 logo-bg">
                <h1 className="text-9xl font-bold font-logo text-transparent">
                  itme
                </h1>
                <h1 className="text-6xl font-bold font-logo text-transparent">
                  online
                </h1>
              </div>
              <LoginUI/>
            </div>
        ) : (
          <Loader className="flex flex-row justify-center mt-36"/>
        )
      ) }
    </div>
  )
}
