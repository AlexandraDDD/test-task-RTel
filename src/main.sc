
theme: /

state: Start
    q!: $regex</start>
    a: Hello! Let's begin by reviewing your vocabulary. Please translate the following English words into Russian.
    script: GenerateWord
    go!: Translate

state: Translate
    a: {{$session.word_to_translate}}
    q!: $any
    script: CheckAnswer
    go!: Correct when $session.correct
    go!: Wrong otherwise

state: Correct
    a: Correct! Nice!
    script: CheckFinish

state: Wrong
    a: Wrong :( Some of the possible translations for "{{$session.word_to_translate}}" are: {{$session.correct_translations}}
    script: CheckFinish

state: NextWord
    a: The next word is "{{$session.word_to_translate}}"
    go!: Translate

state: Finish
    a: Correct answers: {{$session.correct_count}}. Wrong answers: {{$session.wrong_count}}. Goodbye, see you later!
    go!: END

state: NoMatch
    event!: noMatch
    a: I do not understand. You said: {{$request.query}}
