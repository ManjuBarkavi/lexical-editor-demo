import React, { useState, useEffect } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { PlainTextPlugin } from '@lexical/react/LexicalPlainTextPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ParagraphNode, TextNode, $getRoot, $getSelection, $isRangeSelection, $createTextNode } from "lexical";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { InitialParagraphPlugin } from "./InitialParagraphPlugin";
import { CharacterLimitPlugin } from "./CharacterLimitPlugin";

const TAGS = ["Business name", "Appt. date and time", "Appt. date", "Service name", "Appt time", "Provider first name", "Provider last name"];

const editorConfig = {
  namespace: "MyEditor",
  theme: {
    paragraph: "editor-paragraph",
    ltr: "ltr",
  },
  nodes: [ParagraphNode, TextNode],
  onError: (error) => {
    console.error("Lexical Error:", error);
  },
};

const DraggableTag = ({ tag }) => {
  const [{ isDragging }, drag] = useDrag({
    type: "TAG",
    item: { tag },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <span
      ref={drag}
      className={`ps-1 pe-2 h-6 bg-neutral-secondary gap-1 inline-flex items-center outline-none rounded-full transition-colors active:bg-neutral-secondary-pressed active:cursor-grabbing cursor-grab hover:bg-neutral-secondary-hover ${isDragging ? 'opacity-50' : 'opacity-100'}`}
    >
      <span class="shrink-0 flex items-center">
        <svg aria-hidden="true" fill-rule="evenodd" focusable="false" preserveAspectRatio="xMidYMid meet" role="img" viewBox="0 0 480 480" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 fill-secondary">
          <path d="M162 120.1a28 28 0 1 1 56-.1 28 28 0 0 1-56 .1Zm28 91.9a28 28 0 1 0 0 56 28 28 0 1 0 0-56Zm0 120a28 28 0 1 0 0 56 28 28 0 1 0 0-56Zm110 0a28 28 0 1 0 0 56 28 28 0 1 0 0-56Zm-28-91.9a28 28 0 1 1 56-.1 28 28 0 0 1-56 .1ZM300 92a28 28 0 1 0 0 56 28 28 0 1 0 0-56Z"></path>
        </svg>
      </span>
      <span>{tag}</span>
    </span>
  );
};
function EditorPlugins({ setPreview, setCharCount }) {
  const [editor] = useLexicalComposerContext();

  const [{ isOver }, dropRef] = useDrop({
    accept: "TAG",
    drop: ({ tag }) => {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const textNode = $createTextNode(tag);
          textNode.setStyle("all: unset");
          textNode.setStyle("background-color: #f4f4f4; padding: 4px 8px; border-radius: 4px; cursor: pointer; border-radius: 9999px;");
          selection.insertNodes([textNode]);
        }
      });
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const text = $getRoot().getTextContent();
        setPreview(text);
      });
    });
  }, [editor, setPreview]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      editor.focus();
    }, 0);
    return () => clearTimeout(timeout);
  }, [editor]);

  return (
    <>
      <InitialParagraphPlugin />
      <PlainTextPlugin
        contentEditable={
          <div ref={dropRef}>
            <ContentEditable aria-placeholder={'Enter some text...'}
              className={`border border-gray-300 p-3 min-h-[120px] rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
              style={{
                backgroundColor: isOver ? "#f0f8ff" : "#fff",
              }} />
          </div>
        }
      />
      <HistoryPlugin />
      <OnChangePlugin />
      <CharacterLimitPlugin maxChars={150} onCharCountChange={setCharCount} />
    </>
  );
}

function EditorContainer({ setPreview, setCharCount }) {
  return (
    <LexicalComposer initialConfig={editorConfig}>
      <EditorPlugins setPreview={setPreview} setCharCount={setCharCount} />
    </LexicalComposer>
  );
}

export default function App() {
  const [preview, setPreview] = useState("");
  const [charCount, setCharCount] = useState(0);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="max-w-xl mx-auto p-6">
        <h2 className="block text-body-12 text-primary mb-2">Drag and drop elements, or type, to customize your SMS reminders</h2>

        <div className="flex flex-wrap gap-2">
          {TAGS.map((tag, index) => (
            <DraggableTag tag={tag} key={index} />
          ))}
        </div>

        <EditorContainer setPreview={setPreview} setCharCount={setCharCount} />


        <div className={`flex justify-between mt-2 ${charCount >= 150 ? 'text-red-500' : 'text-black'}`}>
          <p className={`text-red-500 text-body-12 ${charCount >= 150 ? 'visible' : 'invisible'}`}>
            SMS cannot contain more than 150 characters
          </p>
          <span>{charCount}</span>
        </div>


        <h3 className="block text-body-12 text-primary mt-5 mb-2">Preview</h3>
        <textarea
          readOnly
          value={preview}
          autocomplete="off"
          rows="3"
          className="p-2 text-body-16 cursor-default aria-disabled:placeholder:text-disabled flex placeholder:text-secondary resize-none scroll-pb-2 text-primary w-full bg-transparent border-transparent grow peer shadow-none aria-disabled:text-primary bg-neutral-disabled border-input-disabled overflow-hidden rounded-8px border-input-disabled high-contrast:border-dotted [transition-timing-function:ease] border duration-300 peer-focus-within:border-2 peer-focus-within:border-input-active pointer-events-none rounded-8px transition-colors"
        />
      </div>
    </DndProvider>
  );
}