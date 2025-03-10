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

import { addMessagePreSendListener, removeMessagePreSendListener } from "@api/MessageEvents";
import { Devs } from "@utils/constants";
import definePlugin from "@utils/types";
import { DraftStore, FluxDispatcher, SelectedChannelStore } from "@webpack/common";

async function onKeyDown(e: KeyboardEvent) {
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

        const channelId = SelectedChannelStore.getChannelId();
        const currentDraft = DraftStore.getDraft(SelectedChannelStore.getChannelId(), 0);
        if (!currentDraft || !currentDraft.includes(text)) return;

        let newDraft: string;
        if (caps) {
            selection.focusNode.textContent = selection.focusNode.textContent?.replace(text, text.toUpperCase());
            newDraft = currentDraft.replace(text, text.toUpperCase());
        } else {
            selection.focusNode.textContent = selection.focusNode.textContent?.replace(text, text.toLowerCase());
            newDraft = currentDraft.replace(text, text.toLowerCase());
        }

        return await FluxDispatcher.dispatch({
            type: "DRAFT_CHANGE", channelId, draft: newDraft, draftType: 0
        });
    }
}

export default definePlugin({
    name: "MessageCapsLock",
    description: "Use caps lock to switch selected text between uppercase and lowercase",
    authors: [Devs.Noro],
    dependencies: ["MessageEventsAPI"],

    start() {
        this.preSend = addMessagePreSendListener((channelId, messageObj) => {
            const draft = DraftStore.getDraft(channelId, 0);
            if (draft.length > 0) messageObj.content = draft;
            return;
        });

        return document.addEventListener("keydown", onKeyDown);
    },

    stop() {
        removeMessagePreSendListener(this.preSend);
        return document.removeEventListener("keydown", onKeyDown);
    }
});
