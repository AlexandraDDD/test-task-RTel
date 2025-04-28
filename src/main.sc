require: slotfilling/slotFilling.sc
    module = sys.zb-common
require: functions.js

theme: /

    state: Start
        q!: $regex</start>
        a: Hello! Let's begin by reviewing your vocabulary. Please translate the following English words into Russian.
        script: GenerateWord
        script: log($session.word_to_translate)
        a: {{$session.word_to_translate}}
        go: /Translate

    state: Translate
        q!: $regex<.+>
        script:
            CheckAnswer
        if: $session.correct
            go!: /Correct
        else: 
            go!: /Wrong
        event: noMatch || toState = "./"

    state: Correct
        a: Correct! Nice!
        script: CheckFinish
        go!: /NextWord

    state: Wrong
        a: Wrong :( Some of the possible translations for "{{$session.word_to_translate}}" are: {{$session.correct_translations}}
        script: CheckFinish
        go!: /NextWord

    state: NextWord
        a: The next word is "{{$session.word_to_translate}}"
        go!: /Translate

    state: Finish
        a: Correct answers: {{$session.correct_count}}. Wrong answers: {{$session.wrong_count}}. Goodbye, see you later!
        go!: END

    state: NoMatch
        event!: noMatch
        a: I do not understand. You said: {{$request.query}}
  