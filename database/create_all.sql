DROP TABLE IF EXISTS HAND;
CREATE TABLE HAND (
    hand_id                 INT NOT NULL,
    round_wind              VARCHAR(1) NOT NULL,
    seat_wind               VARCHAR(1) NOT NULL,
    is_tsumo                BOOLEAN NOT NULL,
    is_ready                BOOLEAN NOT NULL,
    is_first_around_ready   BOOLEAN NOT NULL,
    is_first_around_win     BOOLEAN NOT NULL,
    is_ready_around_win     BOOLEAN NOT NULL,
    is_last_tile_win        BOOLEAN NOT NULL,
    is_quad_tile_win         BOOLEAN NOT NULL,
    is_quad_turn_win        BOOLEAN NOT NULL,
    PRIMARY KEY (hand_id)
);
CREATE INDEX idx_hand_hand_id ON HAND (hand_id);
CREATE INDEX idx_hand_seat_wind ON HAND (seat_wind);
CREATE INDEX idx_hand_is_tsumo ON HAND (is_tsumo);

DROP SEQUENCE IF EXISTS HAND_ID_SEQ;
CREATE SEQUENCE HAND_ID_SEQ START 1 INCREMENT 1;

DROP TABLE IF EXISTS HAND_TILE;
CREATE TABLE HAND_TILE (
    hand_id                 INT NOT NULL,
    tile_ordinal            INT NOT NULL,
    tile                    VARCHAR(3) NOT NULL,
    PRIMARY KEY (hand_id, tile_ordinal)
);
CREATE INDEX idx_hand_tile_hand_id ON HAND_TILE (hand_id);

DROP TABLE IF EXISTS HAND_MELD;
CREATE TABLE HAND_MELD (
    hand_id                 INT NOT NULL,
    meld_ordinal            INT NOT NULL,
    call_from               VARCHAR(1) NOT NULL,
    PRIMARY KEY (hand_id, meld_ordinal)
);
CREATE INDEX idx_hand_meld_hand_id ON HAND_MELD (hand_id);

DROP TABLE IF EXISTS HAND_MELD_TILE;
CREATE TABLE HAND_MELD_TILE (
    hand_id                 INT NOT NULL,
    meld_ordinal            INT NOT NULL,
    tile_ordinal            INT NOT NULL,
    tile                    VARCHAR(3) NOT NULL,
    PRIMARY KEY (hand_id, meld_ordinal, tile_ordinal)
);
CREATE INDEX idx_hand_meld_tile_hand_id ON HAND_MELD_TILE (hand_id);

DROP TABLE IF EXISTS HAND_UPPER_INDICATOR;
CREATE TABLE HAND_UPPER_INDICATOR (
    hand_id                 INT NOT NULL,
    tile_ordinal            INT NOT NULL,
    tile                    VARCHAR(3) NOT NULL,
    PRIMARY KEY (hand_id, tile_ordinal)
);
CREATE INDEX idx_hand_upper_indicator_hand_id ON HAND_UPPER_INDICATOR (hand_id);

DROP TABLE IF EXISTS HAND_LOWER_INDICATOR;
CREATE TABLE HAND_LOWER_INDICATOR (
    hand_id                 INT NOT NULL,
    tile_ordinal            INT NOT NULL,
    tile                    VARCHAR(3) NOT NULL,
    PRIMARY KEY (hand_id, tile_ordinal)
);
CREATE INDEX idx_hand_lower_indicator_hand_id ON HAND_LOWER_INDICATOR (hand_id);

DROP TABLE IF EXISTS HAND_SCORE;
CREATE TABLE HAND_SCORE (
    hand_id                 INT NOT NULL,
    point                   INT NOT NULL,
    doubles                 INT NOT NULL,
    score                   INT NOT NULL,
    adjusted_score          INT NOT NULL,
    limit_type              VARCHAR(30) NOT NULL,
    is_dealer               BOOLEAN NOT NULL,
    is_hand_limit           BOOLEAN NOT NULL,
    PRIMARY KEY (hand_id)
);
CREATE INDEX idx_hand_score_hand_id ON HAND_SCORE (hand_id);

DROP TABLE IF EXISTS HAND_SCORE_HAND_TYPE;
CREATE TABLE HAND_SCORE_HAND_TYPE (
    hand_id                 INT NOT NULL,
    hand_type_ordinal       INT NOT NULL,
    hand_type_name          VARCHAR(30) NOT NULL,
    doubles                 INT NOT NULL,
    limit_multiplier        INT NOT NULL,
    is_hand_limit           BOOLEAN NOT NULL,
    PRIMARY KEY (hand_id, hand_type_ordinal)
);
CREATE INDEX idx_hand_score_hand_type_hand_id ON HAND_SCORE_HAND_TYPE (hand_id);

DROP TABLE IF EXISTS HAND_SCORE_POINT_TYPE;
CREATE TABLE HAND_SCORE_POINT_TYPE (
    hand_id                 INT NOT NULL,
    point_type_ordinal      INT NOT NULL,
    point_type_name         VARCHAR(30) NOT NULL,
    point                   INT NOT NULL,
    PRIMARY KEY (hand_id, point_type_ordinal)
);
CREATE INDEX idx_hand_score_point_type_hand_id ON HAND_SCORE_POINT_TYPE (hand_id);
