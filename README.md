* Topic: Smart farming with web service and pub-sub model.

Description: Assume that we have a plant in particular; let's say we have a mushroom house farm. We have a minimum of 3 sensors: humidity, temperature, and wind. Everything is in a simulation; we don't need to have an ESP32 board. We need to implement a pub-sub model (MQTT) and some kind of service. For example, if the temperature is too low, the system will turn on the AC to balance out the farm. Or if the dirt is too dry, then we can warn the farmer.

* Installing packages via cmd:
npm install dotenv express mqtt nodemon pg

* Creating database table:
-- Table: public.mushroom_house_sensors

-- DROP TABLE IF EXISTS public.mushroom_house_sensors;

CREATE TABLE IF NOT EXISTS public.mushroom_house_sensors
(
    id bigint NOT NULL DEFAULT nextval('mushroom_house_sensors_id_seq'::regclass),
    temperature real NOT NULL,
    humidity real NOT NULL,
    wind real NOT NULL,
    "timestamp" timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT mushroom_house_sensors_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.mushroom_house_sensors
    OWNER to postgres;