# RULE : Quand j'annonce un changement « neutre ici, bénéfique là », NOMMER l'axe qui diffère — sinon les deux moitiés de la phrase se contredisent

## Contexte

En proposant de sortir `ScanModule`/`TranscodingModule` de `MediaModule` vers `AppModule`
pour taire ~75 lignes de bruit dans la suite d'intégration, j'ai écrit à l'utilisateur :

> « Nest construit **un seul** container. Un module atteint par plusieurs chemins n'est
> instancié qu'une fois. Même module, atteint, une fois. C'est exactement pour ça que
> c'est neutre. »

puis, dans le même message, que le déplacement supprimerait l'adapter ONNX de ~60 graphes.

L'utilisateur a bloqué, à juste titre : « tu me dis justement que ça instancie qu'une fois
donc pourquoi ça changerait quelque chose de le remonter d'un cran ? »

## Erreur commise

Avoir posé une propriété (le singleton de module) pour justifier la **neutralité**, et une
conséquence opposée pour justifier le **gain**, sans jamais nommer la variable qui change
entre les deux : le **nombre et la composition des graphes**. En prod il y a un graphe
racine qui atteint tout — inchangé. En test il y a ~120 graphes partiels montés à la main,
dont aucun n'est `AppModule` — et c'est leur **appartenance** qui change, pas la
multiplicité des instanciations à l'intérieur d'un graphe.

Les deux affirmations étaient vraies. Mises côte à côte sans l'axe, elles se lisent comme
une contradiction, et le lecteur a raison de refuser de valider.

## Cause racine

J'ai raisonné sur la bonne variable (appartenance à un graphe) mais argumenté avec une
autre (nombre d'instances par graphe), parce que le singleton est l'argument le plus court
pour prouver la neutralité en prod. En optimisant la démonstration d'une moitié, j'ai
rendu l'autre moitié incompréhensible.

C'est un cousin de `fix-raisonnement-invariant-delegue-doit-etre-calcule.md` : là-bas une
analyse juste devenait fausse en la paraphrasant ; ici deux affirmations justes deviennent
inintelligibles en omettant ce qui les relie.

## Règle à appliquer

1. **Toute proposition de la forme « ça ne change rien en X mais ça change tout en Y » doit
   nommer explicitement l'axe le long duquel X et Y diffèrent**, dans la même phrase que la
   revendication. Pas « c'est neutre parce que singleton » + « ça supprime 60 constructions »,
   mais « la prod monte UN graphe racine qui contient tout, avant comme après ; les tests
   montent N graphes partiels, et c'est leur composition qui change ».
2. **Quand deux affirmations vraies se lisent comme une contradiction, c'est un défaut de ma
   démonstration, pas de la compréhension du lecteur.** Ne pas réexpliquer plus fort la même
   chose : identifier la variable cachée et la mettre au premier plan.
3. **Se relire en cherchant la contradiction apparente** avant d'envoyer une justification
   qui combine « neutre » et « gain massif ». Si un lecteur attentif peut opposer ma phrase A
   à ma phrase B, il le fera — et il aura raison de bloquer.
4. Vaut aussi pour les briefs de sous-agents et les descriptions de PR : une justification
   qui se contredit en surface sera soit rejetée, soit appliquée de travers.

## Exemple

- ❌ **Avant (incorrect)** : « Les modules Nest sont des singletons, le module n'est instancié
  qu'une fois → c'est neutre. Et ~60 specs cessent de construire l'adapter ONNX. »
  (Le lecteur : « si c'est une fois, pourquoi le remonter changerait quoi que ce soit ? »)
- ✅ **Après (correct)** : « "Instancié une fois" vaut **par container**. Ce que le
  déplacement change, ce n'est pas le nombre d'instanciations dans un graphe, c'est **quels
  graphes contiennent le module**. La prod monte un seul graphe, la racine, qui l'atteint
  avant comme après — neutre. Les tests montent ~120 graphes partiels dont aucun n'est
  `AppModule` : le module en sort complètement. »
