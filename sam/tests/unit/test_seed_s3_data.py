import os
from unittest import mock

import boto3
import pytest
from moto import mock_s3, mock_apigateway

from sam.seed_s3_data import app


@pytest.fixture()
def cloudformation_event():
    return {
        "RequestType": "Create",
        "ServiceToken": "REDACTED",
        "ResponseURL": "REDACTED",
        "StackId": "REDACTED",
        "RequestId": "REDACTED",
        "LogicalResourceId": "SeedS3Data",
        "ResourceType": "Custom::SeedS3Data",
        "ResourceProperties": {
            "ServiceToken": "REDACTED",
            "PublicWebsiteBucket": "test-bucket-static-website",
            "FilesOpenMode": "In New Tab",
            "SiteName": "TEST_SITE_NAME",
            "IdentityPoolId": "TEST_IDENTITY_POOL",
            "FilesBucketName": "test-bucket-files",
            "VisibleStorageClasses": "STANDARD,STANDARD_IA,ONEZONE_IA,REDUCED_REDUNDANCY"
        }
    }


@mock_s3
def test_seed_data(cloudformation_event):
    boto3.setup_default_session()
    s3 = boto3.client('s3')
    website_bucket = s3.create_bucket(
        Bucket='test-bucket-static-website',
        CreateBucketConfiguration={'LocationConstraint': 'us-west-2'}
    )
    files_bucket = s3.create_bucket(
        Bucket='test-bucket-files',
        CreateBucketConfiguration={'LocationConstraint': 'us-west-2'}
    )
    os.chdir('seed_s3_data')
    ret = app.seed_data(cloudformation_event, None)

    with open('/tmp/website/website/index.html', 'r') as file:                        # nosec hardcoded_tmp_directory
        config_data = file.read()
        assert 'test-bucket-files' in config_data                                     # nosec assert_used
        assert 'TEST_SITE_NAME' in config_data                                        # nosec assert_used
        assert 'TEST_IDENTITY_POOL' in config_data                                    # nosec assert_used
        assert 'STANDARD,STANDARD_IA,ONEZONE_IA,REDUCED_REDUNDANCY' in config_data    # nosec assert_used
        assert 'files_open_in_new_tab: true' in config_data                           # nosec assert_used
    response = s3.list_objects_v2(
        Bucket='test-bucket-static-website'
    )
    assert response['KeyCount'] > 0                                                   # nosec assert_used

@mock_s3
def test_seed_data_with_existing_data(cloudformation_event):
    boto3.setup_default_session()
    s3 = boto3.client('s3')
    website_bucket = s3.create_bucket(
        Bucket='test-bucket-static-website',
        CreateBucketConfiguration={'LocationConstraint': 'us-west-2'}
    )
    images_bucket = s3.create_bucket(
        Bucket='test-bucket-files',
        CreateBucketConfiguration={'LocationConstraint': 'us-west-2'}
    )
    s3.put_object(
        Bucket='test-bucket-static-website',
        Key='test-data-object',
        Body=b'test-data'
    )
    ret = app.seed_data(cloudformation_event, None)
    response = s3.list_objects_v2(
        Bucket='test-bucket-static-website'
    )
    assert response['KeyCount'] == 1                             # nosec assert_used


@mock_s3
def test_delete_data_with_existing_data(cloudformation_event):
    boto3.setup_default_session()
    s3 = boto3.client('s3')
    website_bucket = s3.create_bucket(
        Bucket='test-bucket-static-website',
        CreateBucketConfiguration={'LocationConstraint': 'us-west-2'}
    )
    images_bucket = s3.create_bucket(
        Bucket='test-bucket-files',
        CreateBucketConfiguration={'LocationConstraint': 'us-west-2'}
    )
    s3.put_object(
        Bucket='test-bucket-static-website',
        Key='test-data-object',
        Body=b'test-data'
    )
    ret = app.delete_data(cloudformation_event, None)
    response = s3.list_objects_v2(
        Bucket='test-bucket-static-website'
    )
    assert response['KeyCount'] == 0                             # nosec assert_used
