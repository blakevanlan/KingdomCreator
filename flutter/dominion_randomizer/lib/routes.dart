import 'package:dominion_randomizer/ui/randomizer.dart';
import 'package:flutter/material.dart';

class Routes {
  Routes._();

  static const String randomizer = "/";
  static final routes = <String, WidgetBuilder>{
    randomizer: (BuildContext context) => RandomizerScreen(),
  };
}
