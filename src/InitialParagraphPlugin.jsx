import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useEffect } from 'react';
import { $getRoot, $createParagraphNode } from 'lexical';

export function InitialParagraphPlugin() {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        editor.update(() => {
            const root = $getRoot();
            if (root.getChildrenSize() === 0) {
                const paragraphNode = $createParagraphNode();
                paragraphNode.setDirection('ltr'); // Correctly sets LTR
                root.append(paragraphNode);
            }
        });
    }, [editor]);

    return null;
}
