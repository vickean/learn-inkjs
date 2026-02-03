=== start ===
Welcome, adventurer! What is your name?

* "My name is Aria" -> set_name
* "I am called Kael" -> set_name
* [Remain silent] -> silent_start

=== set_name ===
VAR player_name = ""
VAR player_hp = 100
VAR player_mp = 50
VAR attack_power = 15
VAR defense_power = 10

You tell them your name is {player_name}.

{player_name} it is. Your journey begins now... -> intro_battle