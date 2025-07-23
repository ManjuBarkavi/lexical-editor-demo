// CharacterLimitPlugin.jsx
import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getRoot, KEY_DOWN_COMMAND, COMMAND_PRIORITY_EDITOR } from "lexical";

export function CharacterLimitPlugin({ maxChars, onCharCountChange }) {
    const [editor] = useLexicalComposerContext();
    useEffect(() => {
        return editor.registerUpdateListener(({ editorState }) => {
            editorState.read(() => {
                const textLength = $getRoot().getTextContent().length;
                onCharCountChange(textLength);
            });
        });
    }, [editor, onCharCountChange]);

    useEffect(() => {
        return editor.registerCommand(
            KEY_DOWN_COMMAND,
            (event) => {
                const { key, ctrlKey, altKey, metaKey } = event;

                // Always allow deletions and navigation keys
                if (key === "Backspace" || key === "Delete" || ctrlKey || altKey || metaKey) {
                    return false; // allow lexically processed
                }

                const currentLength = editor.getEditorState().read(() => $getRoot().getTextContent().length);
                // Block input if length limit reached and key is a single character (normal typing)
                if (currentLength >= maxChars && key.length === 1) {
                    event.preventDefault();
                    return true; // handled, block input
                }

                return false; // allow all other keys
            },
            COMMAND_PRIORITY_EDITOR
        );
    }, [editor, maxChars]);

    return null;
}