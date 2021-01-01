import { ExternalLinkIcon } from "../icons"
import { useSelected, useEditor } from 'slate-react';
import { useWebId } from 'swrlit'

const ConceptElement = ({ attributes, children, element }) => {
  const selected = useSelected()
  const editor = useEditor()
  const conceptPrefix = "/notes/"
  return (
    <>
      <a {...attributes} className={`underline text-blue-500 ${selected && "bg-blue-100"}`} href={element.url} >
        {children}
      </a>
      <a href={`${conceptPrefix}${element.name}`} contentEditable={false}>
        <ExternalLinkIcon className="inline" />
      </a>
    </>
  )
}
export default ConceptElement
