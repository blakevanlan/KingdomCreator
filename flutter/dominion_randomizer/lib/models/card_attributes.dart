import 'package:flutter/material.dart';

enum CardAttribute {
  action,
  actionSupplier,
  attack,
  buySupplier,
  doom,
  drawer,
  duration,
  fate,
  multiDrawer,
  night,
  reaction,
  reserve,
  trashing,
  treasure,
  victory,
}

Set<CardAttribute> cardAttributesFromJson(Map<String, dynamic> json) {
  var cardTypes = <CardAttribute>{};
  if (json['isAction'] == true) cardTypes.add(CardAttribute.action);
  if (json['isActionSupplier'] == true) cardTypes.add(CardAttribute.actionSupplier);
  if (json['isAttack'] == true) cardTypes.add(CardAttribute.attack);
  if (json['isBuySupplier'] == true) cardTypes.add(CardAttribute.buySupplier);
  if (json['isDrawer'] == true) cardTypes.add(CardAttribute.drawer);
  if (json['isDoom'] == true) cardTypes.add(CardAttribute.doom);
  if (json['isDuration'] == true) cardTypes.add(CardAttribute.duration);
  if (json['isFate'] == true) cardTypes.add(CardAttribute.fate);
  if (json['isMultiDrawer'] == true) cardTypes.add(CardAttribute.multiDrawer);
  if (json['isNight'] == true) cardTypes.add(CardAttribute.night);
  if (json['isReaction'] == true) cardTypes.add(CardAttribute.reaction);
  if (json['isReserve'] == true) cardTypes.add(CardAttribute.reserve);
  if (json['isTrashing'] == true) cardTypes.add(CardAttribute.trashing);
  if (json['isTreasure'] == true) cardTypes.add(CardAttribute.treasure);
  if (json['isVictory'] == true) cardTypes.add(CardAttribute.victory);
  return cardTypes;
}
