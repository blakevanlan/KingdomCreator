import 'card_attributes.dart';
import 'card_type.dart';
import 'cost.dart';
import 'set_id.dart';

class Card {
  final CardType type;
  final String id;
  final String shortId;
  final SetId setId;
  final String name;
  final Cost cost;
  final Set<CardAttribute> attributes;

  Card(
    this.type,
    this.id,
    this.shortId,
    this.setId,
    this.name,
    this.cost,
    this.attributes,
  );

  Card.fromJson(Map<String, dynamic> json)
    : type = _parseTypeFromId(json['id'] as String),
      id = json['id'] as String,
      shortId = json['shortId'] as String,
      setId = json['setId'] as SetId, // TODO: Fix.
      name = json['name'] as String,
      cost = Cost.fromJson(json),
      attributes = cardAttributesFromJson(json);

  bool hasAttribute(CardAttribute attribute) {
    return attributes.contains(attribute);
  }

  static CardType _parseTypeFromId(String id) {
    if (id.contains('_event_')) {
      return CardType.event;
    }
    if (id.contains('_landmark_')) {
      return CardType.landmark;
    }
    if (id.contains('_project_')) {
      return CardType.project;
    }
    if (id.contains('_way_')) {
      return CardType.way;
    }
    if (id.contains('_boon_')) {
      return CardType.boon;
    }
    return CardType.supply;
  }

  @override
  bool operator ==(o) => o is Card && o.id == id;

  @override
  int get hashCode => id.hashCode;
}
