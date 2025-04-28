

function CheckAnswer(ctx, event, api) {
   
}

function CheckFinish(ctx, event) {
    ctx.session.words_asked = (ctx.session.words_asked || 0) + 1;
    console.log("[CheckFinish] wordsAsked=", ctx.session.words_asked);

    if (ctx.session.words_asked >= 5) {
        ctx.session.finished = true;
        return "/Finish";
    } else {
        GenerateWord(ctx, event);
        return "/NextWord";
    }
}
