/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Noro
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

/* Hello There!
 * this plugin is very simple and may not fit all use but
 * it does with mine! so as it is, it's good enough for my
 * personal use. if you want to make it better, feel free to
 * create a pr or fork it or something idk do what you do
*/

import { Devs } from "@utils/constants";
import definePlugin from "@utils/types";

export default definePlugin({
    name: "MessageCapsLock",
    description: "Use caps lock to switch selected text between uppercase and lowercase",
    authors: [Devs.Noro],
    start() {
        document.addEventListener("keydown", onKeyDown);
    }
});

function onKeyDown(e: KeyboardEvent) {
    if (e.key === "CapsLock") {
        // get current caps lock state
        const caps = e.getModifierState && e.getModifierState("CapsLock");

        // get selected text
        const selection = window.getSelection();
        const text = selection?.toString();
        // existance checks
        if (!selection || !text || !selection?.focusNode?.textContent) return;

        // find div with contenteditable="true" that contains the selected text
        const element = document.querySelectorAll("div[contenteditable=\"true\"] span").values().filter(element => text && element.textContent?.includes(text)).toArray().at(0);
        if (!element) return;

        if (caps) {
            selection.focusNode.textContent = selection.focusNode.textContent?.replace(text, text.toUpperCase());
        } else {
            selection.focusNode.textContent = selection.focusNode.textContent?.replace(text, text.toLowerCase());
        }
    }
    return;
}
