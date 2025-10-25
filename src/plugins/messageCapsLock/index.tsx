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

import "./styles.css";

import { addMessagePreSendListener, removeMessagePreSendListener } from "@api/MessageEvents";
import { Devs } from "@utils/constants";
import definePlugin from "@utils/types";
import { DraftStore, DraftType, FluxDispatcher, SelectedChannelStore } from "@webpack/common";

const getDraft = (channelId: string) => DraftStore.getDraft(channelId, DraftType.ChannelMessage);

function WrapSelection(tagName: string, className: string) {
    const element = document.createElement(tagName);
    element.classList.add(className);
    const select = document.getSelection();
    if (select?.rangeCount) {
        const range = select.getRangeAt(0).cloneRange();
        range.surroundContents(element);
        select.removeAllRanges();
        select.addRange(range);
    }
    return element;
}

async function onKeyDown(e: KeyboardEvent) {
    if (e.ctrlKey && e.key === "CapsLock") {
        // get current caps lock state
        const caps = e.getModifierState && e.getModifierState(e.key);

        const element = document.activeElement as HTMLDivElement;
        if (!element || !element.textContent) return;

        const channelId = SelectedChannelStore.getChannelId();
        const currentDraft = DraftStore.getDraft(SelectedChannelStore.getChannelId(), 0);


        let newDraft: string;
        // TODO: fix having to change the entire text box instead of just the current text
        if (caps) {
            element.style.textTransform = "lowercase";
            newDraft = currentDraft.toLowerCase();
        } else {
            element.style.textTransform = "uppercase";
            newDraft = currentDraft.toUpperCase();
        }

        return await FluxDispatcher.dispatch({
            type: "DRAFT_CHANGE", channelId, draft: newDraft, draftType: 0
        });
    }
    // TODO: use just capslock for selection toggling
    // else if (!e.ctrlKey && e.key === "CapsLock") {
    //     // get current caps lock state
    //     const caps = e.getModifierState && e.getModifierState(e.key);

    //     const element = document.activeElement as HTMLDivElement;
    //     if (!element || !element.textContent) return;

    //     const channelId = SelectedChannelStore.getChannelId();
    //     const currentDraft = DraftStore.getDraft(SelectedChannelStore.getChannelId(), 0);


    //     let newDraft: string;
    //     if (caps) {
    //         const parent = WrapSelection("span", "msg-capslock-lower");
    //         newDraft = currentDraft.replace(parent.innerText, s => s.toLowerCase());
    //     } else {
    //         const parent = WrapSelection("span", "msg-capslock-upper");
    //         newDraft = currentDraft.replace(parent.innerText, s => s.toUpperCase());
    //     }

    //     return await FluxDispatcher.dispatch({
    //         type: "DRAFT_CHANGE", channelId, draft: newDraft, draftType: 0

    //     });
    // }
}

export default definePlugin({
    name: "MessageCapsLock",
    description: "Use CTRL+CapsLock to switch text between uppercase and lowercase",
    authors: [Devs.Noro],
    dependencies: ["MessageEventsAPI"],

    start() {
        this.preSend = addMessagePreSendListener((channelId, messageObj) => {
            const draft = getDraft(channelId);
            if (draft.length > 0 && draft.toLowerCase() === messageObj.content.toLowerCase()) messageObj.content = draft;
            return;
        });

        return document.addEventListener("keydown", onKeyDown);
    },

    stop() {
        removeMessagePreSendListener(this.preSend);
        return document.removeEventListener("keydown", onKeyDown);
    }
});
