Details mbt de database service

Werking van de transactie_archief cache:

In de tabel transacties_archief_day_cache worden cumulatieve statistieken de transacties per dag opgeslagen.
* checkoutdate is de datum waarop de transactie is afgerond.
* count_transacties is het aantal afgeronde transacties op die dag.
* sum_inkomsten is de totale opbrengst van de transacties op die dag (som van de prijs van alle transacties op die dag).
voor nu worden nog kolommen toegevoegd voor de jaar, maand, kwartaal en week, wsl zijn die niet nodig -> nog testen.

In het menu is een optie database toegevoegd: deze opent de database component.
Deze component toont de status van de cache en wordt gebruikt voor het beheer van de cache:
* aanmaken en verwijderen van de cache tabel.
* bijwerken van de cache.
* wissen van de cache.
* tonen van de status van de cache.

Vullen van de cache duurt lang, dus beheerknoppen met beleid gebruiken. Op dit moment wordt de cache niet automatisch bijgewerkt.

