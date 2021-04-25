import 'package:dominion_randomizer/routes.dart';
import 'package:flutter/material.dart';

void main() {
  runApp(DominionRandomizer());
}

class DominionRandomizer extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: "Dominion Randomizer",
      theme: ThemeData(
        primarySwatch: Colors.blue,
      ),
      routes: Routes.routes,
      initialRoute: Routes.randomizer,
    );
  }
}
