preview:
	mv values.yaml values.yaml.tosubst
	envsubst < values.yaml.tosubst > values.yaml
	jx step helm build